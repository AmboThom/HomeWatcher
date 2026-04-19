import { pool } from '../db';
import type {
  CreateAssignmentInput,
  UpdateAssignmentInput,
  CreatePaymentInput,
} from './rent.schemas';

export interface RentAssignment {
  id: string;
  property_id: string;
  tenant_id: string;
  amount: number;
  due_day: number;
  created_at: Date;
  updated_at: Date;
}

export interface RentPayment {
  id: string;
  assignment_id: string;
  amount: number;
  paid_at: Date;
  notes: string | null;
  recorded_by_id: string;
  created_at: Date;
}

function makeError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

async function verifyLandlordOwnsProperty(propertyId: string, landlordId: string): Promise<void> {
  const { rows } = await pool.query(
    'SELECT id FROM properties WHERE id = $1 AND landlord_id = $2',
    [propertyId, landlordId]
  );
  if (rows.length === 0) throw makeError('Property not found', 404);
}

// ── Assignments ────────────────────────────────────────────────────

export async function createAssignment(
  propertyId: string,
  landlordId: string,
  input: CreateAssignmentInput
): Promise<RentAssignment> {
  await verifyLandlordOwnsProperty(propertyId, landlordId);

  const { rows: membership } = await pool.query(
    'SELECT id FROM tenant_properties WHERE property_id = $1 AND tenant_id = $2',
    [propertyId, input.tenant_id]
  );
  if (membership.length === 0) throw makeError('Tenant is not linked to this property', 400);

  const { rows } = await pool.query<RentAssignment>(
    `INSERT INTO rent_assignments (property_id, tenant_id, amount, due_day)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [propertyId, input.tenant_id, input.amount, input.due_day]
  );
  return rows[0];
}

export async function updateAssignment(
  assignmentId: string,
  landlordId: string,
  input: UpdateAssignmentInput
): Promise<RentAssignment> {
  const { rows: existing } = await pool.query<RentAssignment>(
    `SELECT ra.* FROM rent_assignments ra
     INNER JOIN properties p ON p.id = ra.property_id
     WHERE ra.id = $1 AND p.landlord_id = $2`,
    [assignmentId, landlordId]
  );
  if (existing.length === 0) throw makeError('Assignment not found', 404);

  const { rows } = await pool.query<RentAssignment>(
    `UPDATE rent_assignments
     SET amount = COALESCE($1, amount),
         due_day = COALESCE($2, due_day),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [input.amount ?? null, input.due_day ?? null, assignmentId]
  );
  return rows[0];
}

export async function getAssignmentsByProperty(
  propertyId: string,
  landlordId: string
): Promise<RentAssignment[]> {
  await verifyLandlordOwnsProperty(propertyId, landlordId);

  const { rows } = await pool.query<RentAssignment>(
    'SELECT * FROM rent_assignments WHERE property_id = $1 ORDER BY created_at DESC',
    [propertyId]
  );
  return rows;
}

export async function getAssignmentByTenant(tenantId: string): Promise<RentAssignment | null> {
  const { rows } = await pool.query<RentAssignment>(
    'SELECT * FROM rent_assignments WHERE tenant_id = $1',
    [tenantId]
  );
  return rows[0] ?? null;
}

// ── Payments ───────────────────────────────────────────────────────

export async function createPayment(
  assignmentId: string,
  recordedById: string,
  input: CreatePaymentInput
): Promise<RentPayment> {
  const { rows } = await pool.query<RentPayment>(
    `INSERT INTO rent_payments (assignment_id, amount, paid_at, notes, recorded_by_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [assignmentId, input.amount, input.paid_at, input.notes ?? null, recordedById]
  );
  return rows[0];
}

export async function getPaymentsByAssignment(assignmentId: string): Promise<RentPayment[]> {
  const { rows } = await pool.query<RentPayment>(
    'SELECT * FROM rent_payments WHERE assignment_id = $1 ORDER BY paid_at DESC',
    [assignmentId]
  );
  return rows;
}
