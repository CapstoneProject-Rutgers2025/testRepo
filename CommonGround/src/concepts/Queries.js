import bcrypt from "bcrypt";
import { pool } from "../db/db.js"; // db.js is the file that connects to the database

// Create users table
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

// Create user profiles table
async function createUserProfilesTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100), 
        profile_picture TEXT,
        bio TEXT,
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

// Create user interests table
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


// Insert interests for a user
async function insertUserInterests(userId, interests) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const interest of interests) {
        if (interest && interest.trim() !== "") {
          await client.query(
            "INSERT INTO user_interests (user_id, interest) VALUES ($1, $2)",
            [userId, interest.trim()]
          );
        }
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
  
// Get interests for a user
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

// Check for duplicate password
async function isPasswordDuplicate(password) {
    const hashedPasswords = await pool.query("SELECT password FROM users");
    for (let row of hashedPasswords.rows) {
        if (await bcrypt.compare(password, row.password)) {
            return true; // Password is a duplicate
        }
    }
    return false;
}

// Insert a new user
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

// Insert a new user profile (now accepts name)
async function insertUserProfile(userId, profilePicture, bio, name) {
    try {
        await pool.query(
            "INSERT INTO user_profiles (user_id, profile_picture, bio, name) VALUES ($1, $2, $3, $4)",
            [userId, profilePicture, bio, name]
        );
        console.log("User profile created successfully!");
    } catch (err) {
        console.error('Error creating user profile:', err);
        throw err;
    }
}

// Update user profile (updates profile picture, bio, and name)
async function updateUserProfile(userId, profilePicture, bio, name) {
    try {
      await pool.query(
        "UPDATE user_profiles SET profile_picture = $1, bio = $2, name = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4",
        [profilePicture, bio, name, userId]
      );
      console.log("User profile updated successfully!");
    } catch (err) {
      console.error('Error updating user profile!', err);
      throw err;
    }
}
  
// Get user by email
async function getUserByEmail(email) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    } catch (err) {
        console.error('Error fetching user by email:', err);
        throw err;
    }
}

// Get user profile (joins users and user_profiles)
async function getUserProfile(userId) {
    const query = `
      SELECT 
        users.username, 
        user_profiles.name,
        user_profiles.profile_picture, 
        user_profiles.bio,
        user_profiles.user_id
      FROM users
      LEFT JOIN user_profiles ON users.id = user_profiles.user_id
      WHERE users.id = $1
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw err;
    }
}
  
// Create a user (using insertUser)
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

// Create posts table
async function createPostsTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        tags TEXT,
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

async function insertPost(title, content, image_url, user_id, tags) {
    const insertQuery = `
      INSERT INTO posts (title, content, image_url, user_id, tags)
      VALUES ($1, $2, $3, $4, $5) RETURNING id;
    `;
  
    try {
      // 🔍 Ensure tags is always a JSON string for TEXT column
      const formattedTags = Array.isArray(tags)
        ? JSON.stringify(tags)
        : typeof tags === 'string'
          ? tags
          : '[]';
  
      const result = await pool.query(insertQuery, [
        title,
        content,
        image_url,
        user_id,
        formattedTags,
      ]);
  
      return result.rows[0].id;
    } catch (err) {
      console.error('❌ Error inserting post:', err);
      throw err;
    }
  }
  

// Get all posts
async function getPosts() {
    const getPostsQuery = `
        SELECT posts.id, posts.title, posts.content, posts.image_url, posts.tags, posts.created_at, users.id as user_id, users.username AS user_name 
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
async function createChat(type, post_id, user_id) {
  const createChatQuery = `
    INSERT INTO chats (type, post_id, user_id)
    VALUES ($1, $2, $3) 
    RETURNING id
  `;
  try {
    const result = await pool.query(createChatQuery, [type, post_id, user_id]);
    const chatId = result.rows[0].id;

    // ✅ Log when chat is created for better debugging
    console.log(`✅ Chat created! Chat ID: ${chatId}, Post ID: ${post_id}, User ID: ${user_id}`);

    return chatId;
  } catch (error) {
    console.error('❌ Error creating chat:', error);
    throw error;
  }
}

// Add user
async function addUserToChat(chat_id, user_id) {
    const addUserQuery = `
      INSERT INTO chat_users (chat_id, user_id)
      VALUES ($1, $2)
    `;
    try {

      await pool.query(addUserQuery, [chat_id, user_id]);
      console.log('User added to chat!');
    } catch (error) {
      console.error('Error adding user to chat:', error);
      throw error;
    }
  }

  async function getMessagesFromChat(chat_id) {
    const getMessagesQuery = `
      SELECT 
        messages.id,
        messages.content,
        messages.created_at,
        messages.sender_id,
        users.username AS sender,
        user_profiles.profile_picture
      FROM messages
      JOIN users ON messages.sender_id = users.id
      LEFT JOIN user_profiles ON users.id = user_profiles.user_id
      WHERE messages.chat_id = $1
      ORDER BY messages.created_at ASC
    `;
    try {
      const result = await pool.query(getMessagesQuery, [chat_id]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
  


async function insertMessage(chat_id, user_id, content) {
    const insertMessageQuery = `
        INSERT INTO messages (chat_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING id;
    `;
    try {
        const result = await pool.query(insertMessageQuery, [chat_id, user_id, content]);
        return result.rows[0].id;  
    } catch (err) {
        console.error('Error inserting message:', err);
        throw err;
    }
} 

async function removeUserFromChat(chat_id, user_id) {
  const query = `
    DELETE FROM chat_users
    WHERE chat_id = $1 AND user_id = $2
  `;
  try {
    await pool.query(query, [chat_id, user_id]);
    console.log(`User ${user_id} left chat ${chat_id}`);
  } catch (err) {
    console.error("Error removing user from chat:", err);
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
    createChat,
    getMessagesFromChat,
    addUserToChat,
    insertMessage,
    removeUserFromChat,
};