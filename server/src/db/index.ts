import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
  process.exit(1);
});

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('✓ PostgreSQL connection established');
  } finally {
    client.release();
  }
}
