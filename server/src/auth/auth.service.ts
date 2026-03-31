import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { config } from '../config';
import type { RegisterInput, LoginInput } from './auth.schemas';

export interface UserRecord {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

const SALT_ROUNDS = 12;

function makeError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export async function registerUser(input: RegisterInput): Promise<UserRecord> {
  const { email, password, role, first_name, last_name } = input;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw makeError('Email already in use', 409);
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await pool.query<UserRecord>(
    `INSERT INTO users (email, password_hash, role, first_name, last_name)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role, first_name, last_name`,
    [email, password_hash, role, first_name, last_name]
  );

  return rows[0];
}

export async function loginUser(input: LoginInput): Promise<UserRecord> {
  const { email, password } = input;

  const { rows } = await pool.query<UserRecord & { password_hash: string }>(
    'SELECT id, email, role, first_name, last_name, password_hash FROM users WHERE email = $1',
    [email]
  );

  const user = rows[0];
  if (!user) throw makeError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw makeError('Invalid credentials', 401);

  const { password_hash: _omit, ...userRecord } = user;
  return userRecord;
}

export function signAccessToken(user: UserRecord): string {
  const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(user: UserRecord): string {
  return jwt.sign({ sub: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, config.jwt.refreshSecret) as { sub: string };
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const { rows } = await pool.query<UserRecord>(
    'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}
