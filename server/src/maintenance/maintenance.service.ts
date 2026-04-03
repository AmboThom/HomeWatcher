import { pool } from '../db';
import type { CreateMaintenanceInput, UpdateMaintenanceStatusInput } from './maintenance.schemas';

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
  return rows[0];
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
  return rows[0];
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
