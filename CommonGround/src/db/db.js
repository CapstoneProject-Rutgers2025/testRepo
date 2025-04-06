import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ⬇️ Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬇️ Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

const { Pool } = pkg;

// ⬇️ Always use SSL for Render-hosted PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
export { pool };

export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}
