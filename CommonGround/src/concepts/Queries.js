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

async function populateUserProfiles() {
    const adjectives = [
        "Genius", "Crazy", "Wacky", "Silly", "Brilliant", "Quirky", "Zany", "Nerdy", "Hyper", "Funky"
    ];
    const nouns = [
        "Nerd", "Wizard", "Gamer", "Coder", "Artist", "Thinker", "Dreamer", "Creator", "Explorer", "Inventor"
    ];

    const insertDefaultProfilesQuery = `
        INSERT INTO user_profiles (user_id, name, profile_picture, bio, tags)
        SELECT 
            users.id, 
            (
                SELECT 
                    CONCAT(
                        adjectives.adj, 
                        nouns.noun, 
                        floor(random() * 100 + 1)::TEXT
                    )
                FROM 
                    (SELECT UNNEST(ARRAY[${adjectives.map(adj => `'${adj}'`).join(",")}]) AS adj) AS adjectives,
                    (SELECT UNNEST(ARRAY[${nouns.map(noun => `'${noun}'`).join(",")}]) AS noun) AS nouns
                ORDER BY random()
                LIMIT 1
            ) AS name,
            NULL, 
            NULL, 
            ARRAY[]::TEXT[]
        FROM users
        LEFT JOIN user_profiles ON users.id = user_profiles.user_id
        WHERE user_profiles.user_id IS NULL;
    `;
    try {
        await pool.query(insertDefaultProfilesQuery);
        console.log("Default profiles with wacky names added for users without profiles!");
    } catch (err) {
        console.error("Error populating user profiles:", err);
        throw err;
    }
}

async function createUserProfilesTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100), 
        profile_picture TEXT,
        bio TEXT,
        tags TEXT[], -- This column is no longer used for interests, as interests are stored in user_interests
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    `;
    try {
        await pool.query(createTableQuery);
        console.log("User profiles table created successfully!");
    } catch (err) {
        console.error('Error creating user profiles table!', err);
    }
}

async function createUserInterestsTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_interests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        interest VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    `;
    try {
        await pool.query(createTableQuery);
        console.log("User interests table created successfully!");
    } catch (err) {
        console.error('Error creating user interests table!', err);
    }
}

async function insertUserInterests(userId, interests) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const interest of interests) {
            await client.query(
                "INSERT INTO user_interests (user_id, interest) VALUES ($1, $2)",
                [userId, interest]
            );
        }
        await client.query('COMMIT');
        console.log("User interests added successfully!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding user interests!', err);
        throw err;
    } finally {
        client.release();
    }
}

async function getUserInterests(userId) {
    try {
        const result = await pool.query(
            "SELECT interest FROM user_interests WHERE user_id = $1",
            [userId]
        );
        return result.rows.map(row => row.interest);
    } catch (err) {
        console.error('Error fetching user interests!', err);
        throw err;
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

async function insertUserProfile(userId, profilePicture, bio, tags) {
    try {
        // Always insert an empty array for tags
        await pool.query(
            "INSERT INTO user_profiles (user_id, profile_picture, bio, tags) VALUES ($1, $2, $3, $4)",
            [userId, profilePicture, bio, []]
        );
        console.log("User profile created successfully!");
    } catch (err) {
        console.error('Error creating user profile:', err);
        throw err;
    }
}

async function updateUserProfile(userId, profilePicture, bio) {
    try {
        // Update only profile_picture and bio; leave tags unchanged
        await pool.query(
            "UPDATE user_profiles SET profile_picture = $1, bio = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3",
            [profilePicture, bio, userId]
        );
        console.log("User profile updated successfully!");
    } catch (err) {
        console.error('Error updating user profile!', err);
        throw err;
    }
}

async function getUserByEmail(email) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    } catch (err) {
        console.error('Error fetching user by email:', err);
        throw err;
    }
}

async function getUserProfile(userId) {
    try {
        const result = await pool.query(
            "SELECT * FROM user_profiles WHERE user_id = $1",
            [userId]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error fetching user profile:', err);
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

async function createPostsTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    `;
    try {
        await pool.query(createTableQuery);
        console.log("Posts table created successfully!");
    } catch (err) {
        console.error('Error creating posts table!', err);
    }
}

async function insertPost(title, content, image_url, user_id) {
    const insertQuery = `
        INSERT INTO posts (title, content, image_url, user_id)
        VALUES ($1, $2, $3, $4) RETURNING id;
    `;
    try {
        const result = await pool.query(insertQuery, [title, content, image_url, user_id]);
        return result.rows[0].id;
    } catch (err) {
        console.error('Error inserting post', err);
        throw err;
    }
}

async function getPosts() {
    const getPostsQuery = `
        SELECT posts.id, posts.title, posts.content, posts.image_url, posts.created_at, users.id as user_id, users.username AS user_name 
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC;
    `;
    try {
        const result = await pool.query(getPostsQuery);
        return result.rows;
    } catch (err) {
        console.error('Error retrieving posts', err);
        throw err;
    }
}

export {
    createUsersTable,
    createUserProfilesTable,
    createUserInterestsTable,
    createUser,
    insertUser,
    isPasswordDuplicate,
    getUserByEmail,
    insertUserProfile,
    updateUserProfile,
    getUserProfile,
    insertUserInterests,
    getUserInterests,
    createPostsTable,
    insertPost,
    getPosts,
    populateUserProfiles
};
