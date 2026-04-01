import { pool } from '../db';
import type { CreateInviteInput } from './invites.schemas';
import type { PropertyRecord } from '../properties/properties.service';

export interface InviteRecord {
  id: string;
  property_id: string;
  code: string;
  expires_at: Date;
  max_uses: number;
  uses_count: number;
  created_at: Date;
}

function makeError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment()}-${segment()}`;
}

async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    const { rows } = await pool.query('SELECT id FROM property_invites WHERE code = $1', [code]);
    if (rows.length === 0) return code;
  }
  throw makeError('Failed to generate a unique invite code, please try again', 500);
}

export async function revokeInvite(
  propertyId: string,
  landlordId: string,
  code: string
): Promise<void> {
  const { rows: prop } = await pool.query(
    'SELECT id FROM properties WHERE id = $1 AND landlord_id = $2',
    [propertyId, landlordId]
  );
  if (prop.length === 0) throw makeError('Property not found', 404);

  const { rowCount } = await pool.query(
    'DELETE FROM property_invites WHERE property_id = $1 AND code = $2',
    [propertyId, code]
  );
  if (rowCount === 0) throw makeError('Invite code not found', 404);
}

export async function listInvites(
  propertyId: string,
  landlordId: string
): Promise<InviteRecord[]> {
  const { rows: prop } = await pool.query(
    'SELECT id FROM properties WHERE id = $1 AND landlord_id = $2',
    [propertyId, landlordId]
  );
  if (prop.length === 0) throw makeError('Property not found', 404);

  const { rows } = await pool.query<InviteRecord>(
    'SELECT * FROM property_invites WHERE property_id = $1 ORDER BY created_at DESC',
    [propertyId]
  );
  return rows;
}

export async function createInvite(
  propertyId: string,
  landlordId: string,
  input: CreateInviteInput
): Promise<InviteRecord> {
  const { rows: prop } = await pool.query(
    'SELECT id FROM properties WHERE id = $1 AND landlord_id = $2',
    [propertyId, landlordId]
  );
  if (prop.length === 0) throw makeError('Property not found', 404);

  const code = await generateUniqueCode();

  const { rows } = await pool.query<InviteRecord>(
    `INSERT INTO property_invites (property_id, code, expires_at, max_uses)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [propertyId, code, input.expires_at, input.max_uses]
  );
  return rows[0];
}

export async function redeemInvite(tenantId: string, code: string): Promise<PropertyRecord> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: invites } = await client.query<InviteRecord>(
      'SELECT * FROM property_invites WHERE code = $1 FOR UPDATE',
      [code]
    );
    const invite = invites[0];
    if (!invite) throw makeError('Invalid invite code', 404);

    if (new Date(invite.expires_at) < new Date()) {
      throw makeError('Invite code has expired', 400);
    }
    if (invite.uses_count >= invite.max_uses) {
      throw makeError('Invite code has reached its maximum uses', 400);
    }

    const { rows: existing } = await client.query(
      'SELECT id FROM tenant_properties WHERE tenant_id = $1 AND property_id = $2',
      [tenantId, invite.property_id]
    );
    if (existing.length > 0) throw makeError('You are already linked to this property', 409);

    await client.query(
      'INSERT INTO tenant_properties (tenant_id, property_id) VALUES ($1, $2)',
      [tenantId, invite.property_id]
    );

    await client.query(
      'UPDATE property_invites SET uses_count = uses_count + 1 WHERE id = $1',
      [invite.id]
    );

    const { rows: properties } = await client.query<PropertyRecord>(
      'SELECT * FROM properties WHERE id = $1',
      [invite.property_id]
    );

    await client.query('COMMIT');
    return properties[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
