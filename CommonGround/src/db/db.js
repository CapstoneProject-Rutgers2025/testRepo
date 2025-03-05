import pkg from 'pg'; // Import the entire 'pg' package
import dotenv from 'dotenv'; // Import dotenv to load environment variables

dotenv.config(); // Load environment variables from .env file

const { Pool } = pkg; // Destructure the Pool object from the imported package

// Create a new pool instance, managing database connections
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

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