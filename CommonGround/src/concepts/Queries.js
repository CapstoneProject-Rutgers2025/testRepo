import bcrypt from "bcrypt";
import { pool } from "../db/db.js"; // db.js is the file that connects to the database

async function createUsersTable() {    
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    `;
    try {
       await pool.query(createTableQuery);
        console.log("Users table created successfully!");
    } catch (err) {
        console.error('Error creating users table!', err);
    }
}

async function isPasswordDuplicate(password) {
    const hashedPasswords = await pool.query("SELECT password FROM users");
    
    for (let row of hashedPasswords.rows) {
        if (await bcrypt.compare(password, row.password)) {
            return true; // Password is a duplicate
        }
    }
    return false;
}
async function insertUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
            [username, email, hashedPassword]
        );
        console.log("User created successfully!");
    } catch (err) {
        console.error('Error creating user!', err);
    }
}

export async function getUserByEmail(email) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    } catch (err) {
        console.error('Error fetching user by email:', err);
        throw err;
    }
}

async function createUser(username, email, password) {
    if (await isPasswordDuplicate(password)) {
        throw new Error("Password is already in use. Please choose a different one.");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
            [username, email, hashedPassword]
        );
        console.log("User created successfully!");
    } catch (err) {
        console.error('Error creating user!', err);
    }
}

export { createUsersTable, createUser, insertUser, isPasswordDuplicate }; 