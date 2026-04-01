import { pool } from '../db';
import type { CreatePropertyInput, UpdatePropertyInput } from './properties.schemas';

export interface PropertyRecord {
  id: string;
  landlord_id: string;
  name: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

function makeError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export async function createProperty(
  landlordId: string,
  input: CreatePropertyInput
): Promise<PropertyRecord> {
  const { rows } = await pool.query<PropertyRecord>(
    `INSERT INTO properties (landlord_id, name, address)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [landlordId, input.name, input.address]
  );
  return rows[0];
}

export async function getPropertiesByLandlord(landlordId: string): Promise<PropertyRecord[]> {
  const { rows } = await pool.query<PropertyRecord>(
    'SELECT * FROM properties WHERE landlord_id = $1 ORDER BY created_at DESC',
    [landlordId]
  );
  return rows;
}

export async function getPropertyById(id: string): Promise<PropertyRecord | null> {
  const { rows } = await pool.query<PropertyRecord>(
    'SELECT * FROM properties WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function updateProperty(
  id: string,
  landlordId: string,
  input: UpdatePropertyInput
): Promise<PropertyRecord> {
  const property = await getPropertyById(id);
  if (!property) throw makeError('Property not found', 404);
  if (property.landlord_id !== landlordId) throw makeError('Forbidden', 403);

  const { rows } = await pool.query<PropertyRecord>(
    `UPDATE properties
     SET name = COALESCE($1, name),
         address = COALESCE($2, address),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [input.name ?? null, input.address ?? null, id]
  );
  return rows[0];
}

export async function deleteProperty(id: string, landlordId: string): Promise<void> {
  const property = await getPropertyById(id);
  if (!property) throw makeError('Property not found', 404);
  if (property.landlord_id !== landlordId) throw makeError('Forbidden', 403);

  await pool.query('DELETE FROM properties WHERE id = $1', [id]);
}
