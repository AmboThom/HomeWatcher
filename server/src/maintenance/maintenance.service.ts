import { pool } from '../db';
import type { CreateMaintenanceInput, UpdateMaintenanceStatusInput } from './maintenance.schemas';
import {
  sendMaintenanceRequestNotification,
  sendStatusUpdateNotification,
} from '../email/email.service';

export interface MaintenanceRecord {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: Date;
  updated_at: Date;
}

function makeError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export async function createRequest(
  tenantId: string,
  propertyId: string,
  input: CreateMaintenanceInput
): Promise<MaintenanceRecord> {
  // Verify the tenant is linked to this property
  const { rows: membership } = await pool.query(
    'SELECT id FROM tenant_properties WHERE tenant_id = $1 AND property_id = $2',
    [tenantId, propertyId]
  );
  if (membership.length === 0) throw makeError('Property not found', 404);

  const { rows } = await pool.query<MaintenanceRecord>(
    `INSERT INTO maintenance_requests (property_id, tenant_id, title, description, priority)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [propertyId, tenantId, input.title, input.description, input.priority]
  );
  const request = rows[0];

  // Notify landlord — fire and forget, does not affect the response
  pool.query<{ email: string; first_name: string; last_name: string; name: string }>(
    `SELECT u.email, u.first_name, u.last_name, p.name
     FROM properties p
     INNER JOIN users u ON u.id = p.landlord_id
     WHERE p.id = $1`,
    [propertyId]
  ).then(({ rows: info }) => {
    if (!info[0]) return;
    pool.query<{ first_name: string; last_name: string }>(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [tenantId]
    ).then(({ rows: tenant }) => {
      if (!tenant[0]) return;
      sendMaintenanceRequestNotification({
        landlordEmail: info[0].email,
        landlordName: `${info[0].first_name} ${info[0].last_name}`,
        tenantName: `${tenant[0].first_name} ${tenant[0].last_name}`,
        propertyName: info[0].name,
        title: input.title,
        priority: input.priority,
      });
    });
  }).catch((err) => console.error('Failed to fetch landlord info for notification:', err));

  return request;
}

export async function getRequestsByProperty(
  propertyId: string,
  landlordId: string
): Promise<MaintenanceRecord[]> {
  // Verify the landlord owns this property
  const { rows: prop } = await pool.query(
    'SELECT id FROM properties WHERE id = $1 AND landlord_id = $2',
    [propertyId, landlordId]
  );
  if (prop.length === 0) throw makeError('Property not found', 404);

  const { rows } = await pool.query<MaintenanceRecord>(
    `SELECT * FROM maintenance_requests
     WHERE property_id = $1
     ORDER BY created_at DESC`,
    [propertyId]
  );
  return rows;
}

export async function updateRequestStatus(
  requestId: string,
  landlordId: string,
  input: UpdateMaintenanceStatusInput
): Promise<MaintenanceRecord> {
  // Verify the landlord owns the property this request belongs to
  const { rows: existing } = await pool.query<MaintenanceRecord>(
    `SELECT mr.* FROM maintenance_requests mr
     INNER JOIN properties p ON p.id = mr.property_id
     WHERE mr.id = $1 AND p.landlord_id = $2`,
    [requestId, landlordId]
  );
  if (existing.length === 0) throw makeError('Request not found', 404);

  const { rows } = await pool.query<MaintenanceRecord>(
    `UPDATE maintenance_requests
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [input.status, requestId]
  );
  const updated = rows[0];

  // Notify tenant — fire and forget
  pool.query<{ email: string; first_name: string; last_name: string; name: string }>(
    `SELECT u.email, u.first_name, u.last_name, p.name
     FROM maintenance_requests mr
     INNER JOIN users u ON u.id = mr.tenant_id
     INNER JOIN properties p ON p.id = mr.property_id
     WHERE mr.id = $1`,
    [requestId]
  ).then(({ rows: info }) => {
    if (!info[0]) return;
    sendStatusUpdateNotification({
      tenantEmail: info[0].email,
      tenantName: `${info[0].first_name} ${info[0].last_name}`,
      propertyName: info[0].name,
      title: existing[0].title,
      status: input.status,
    });
  }).catch((err) => console.error('Failed to fetch tenant info for notification:', err));

  return updated;
}

export async function getRequestsByTenant(tenantId: string): Promise<MaintenanceRecord[]> {
  const { rows } = await pool.query<MaintenanceRecord>(
    `SELECT * FROM maintenance_requests
     WHERE tenant_id = $1
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return rows;
}
