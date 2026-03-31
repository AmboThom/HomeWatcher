import fs from 'fs';
import path from 'path';
import { pool, testConnection } from './index';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate(): Promise<void> {
  await testConnection();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id      SERIAL       PRIMARY KEY,
        name    VARCHAR(255) NOT NULL UNIQUE,
        run_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    const { rows: ran } = await client.query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY name'
    );
    const ranSet = new Set(ran.map((r) => r.name));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (ranSet.has(file)) {
        console.log(`  skip  ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✓ ran  ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('✓ Migrations complete');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
