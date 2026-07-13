import { pool } from '../db';
import type { CreateBillInput, UpdateBillInput } from './bills.schemas';

export interface Bill {
  id: string;
  property_id: string;
  created_by_id: string;
  payee: string;
  category: string;
  amount: number;
  paid_at: string;
  due_date: string | null;
  is_recurring: boolean;
  frequency: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BillWithLogger extends Bill {
  first_name?: string;
  last_name?: string;
}

interface BillUser {
  id: string;
  role: string;
}

function makeError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

async function verifyPropertyAccess(propertyId: string, user: BillUser): Promise<void> {
  const query =
    user.role === 'landlord'
      ? 'SELECT id FROM properties WHERE id = $1 AND landlord_id = $2'
      : 'SELECT id FROM tenant_properties WHERE property_id = $1 AND tenant_id = $2';
  const { rows } = await pool.query(query, [propertyId, user.id]);
  if (rows.length === 0) throw makeError('Property not found', 404);
}

export async function createBill(
  propertyId: string,
  user: BillUser,
  input: CreateBillInput
): Promise<Bill> {
  await verifyPropertyAccess(propertyId, user);

  const { rows } = await pool.query<Bill>(
    `INSERT INTO bills (property_id, created_by_id, payee, category, amount, paid_at, due_date, is_recurring, frequency, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      propertyId,
      user.id,
      input.payee,
      input.category,
      input.amount,
      input.paid_at,
      input.due_date ?? null,
      input.is_recurring,
      input.is_recurring ? input.frequency : null,
      input.notes ?? null,
    ]
  );
  return rows[0];
}

export async function getBillsByProperty(
  propertyId: string,
  user: BillUser
): Promise<BillWithLogger[]> {
  await verifyPropertyAccess(propertyId, user);

  if (user.role === 'landlord') {
    const { rows } = await pool.query<BillWithLogger>(
      `SELECT b.*, u.first_name, u.last_name
       FROM bills b
       INNER JOIN users u ON u.id = b.created_by_id
       WHERE b.property_id = $1
       ORDER BY b.paid_at DESC, b.created_at DESC`,
      [propertyId]
    );
    return rows;
  }

  const { rows } = await pool.query<BillWithLogger>(
    `SELECT * FROM bills
     WHERE property_id = $1 AND created_by_id = $2
     ORDER BY paid_at DESC, created_at DESC`,
    [propertyId, user.id]
  );
  return rows;
}

export async function updateBill(
  billId: string,
  userId: string,
  input: UpdateBillInput
): Promise<Bill> {
  const { rows: existing } = await pool.query<Bill>(
    'SELECT * FROM bills WHERE id = $1 AND created_by_id = $2',
    [billId, userId]
  );
  if (existing.length === 0) throw makeError('Bill not found', 404);

  const isRecurring = input.is_recurring ?? existing[0].is_recurring;
  const frequency = isRecurring ? input.frequency ?? existing[0].frequency : null;
  if (isRecurring && !frequency) {
    throw makeError('Frequency is required for recurring bills', 400);
  }

  const { rows } = await pool.query<Bill>(
    `UPDATE bills
     SET payee = COALESCE($1, payee),
         category = COALESCE($2, category),
         amount = COALESCE($3, amount),
         paid_at = COALESCE($4, paid_at),
         due_date = COALESCE($5, due_date),
         is_recurring = $6,
         frequency = $7,
         notes = COALESCE($8, notes),
         updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [
      input.payee ?? null,
      input.category ?? null,
      input.amount ?? null,
      input.paid_at ?? null,
      input.due_date ?? null,
      isRecurring,
      frequency,
      input.notes ?? null,
      billId,
    ]
  );
  return rows[0];
}

export async function deleteBill(billId: string, user: BillUser): Promise<void> {
  const result =
    user.role === 'landlord'
      ? await pool.query(
          `DELETE FROM bills b
           USING properties p
           WHERE b.id = $1 AND b.property_id = p.id
             AND (b.created_by_id = $2 OR p.landlord_id = $2)`,
          [billId, user.id]
        )
      : await pool.query('DELETE FROM bills WHERE id = $1 AND created_by_id = $2', [
          billId,
          user.id,
        ]);
  if (result.rowCount === 0) throw makeError('Bill not found', 404);
}
