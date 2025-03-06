import pkg from 'pg'; // Import the entire 'pg' package
import dotenv from 'dotenv'; // Import dotenv to load environment variables

dotenv.config(); // Load environment variables from .env file

const { Pool } = pkg; // Destructure the Pool object from the imported package

// Create a new pool instance, managing database connections
const pool = new Pool({
    user: 'admin', // Default PostgreSQL user
    host: 'virginia-postgres.render.com', // Default PostgreSQL host
    database: 'db_54al',
    password: 'yPqASFsvtBNMKwSiUHGEniwP9eqB7vAf', // Default PostgreSQL password
    port: 5432, // Default PostgreSQL port
    ssl: {
        rejectUnauthorized: false, // Allow self-signed certificates
    },
});

export default pool;

export { pool };

async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        // Execute query and log the time it took
        const duration = Date.now() - start;

        console.log('executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export { query };