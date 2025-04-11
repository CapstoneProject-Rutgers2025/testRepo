import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool } from './db/db.js';
import cloudinary from './cloudinary.js';
import streamifier from 'streamifier';
import { Server } from "socket.io";
import http from "http";

import {
  createUsersTable,
  createUserProfilesTable,
  insertUserProfile,
  updateUserProfile,
  getUserProfile,
  getUserByEmail,
  createUserInterestsTable,
  insertUserInterests,
  getUserInterests,
  insertUser,
  createPostsTable,
  insertPost,
  getPosts,
  createChat,
  addUserToChat,
  getMessagesFromChat,
  insertMessage

} from './concepts/Queries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 10000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['https://commonnground.netlify.app', 'http://localhost:5173'], // Allow frontend origins
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach `io` to the app for global access
app.set('io', io);

// WebSocket logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
  });

  socket.on('leaveRoom', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left room ${chatId}`);
  });

  socket.on('sendMessage', async (message) => {
    console.log('Message received:', message);

    try {
      // Save the message to the database
      const savedMessage = await saveMessage(
        message.chat_id,
        message.sender_id,
        message.content
      );

      // Broadcast the saved message to the specific chat room
      io.to(message.chat_id).emit('receiveMessage', savedMessage);
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});



app.use((req, res, next) => {
  const allowedOrigins = ['https://commonnground.netlify.app', 'http://localhost:5173'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize tables
createUsersTable();
createUserProfilesTable();
createUserInterestsTable();
createPostsTable();

// === Routes ===
const BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.RENDER_URL
  : process.env.LOCAL_URL;

console.log(`Using BASE_URL: ${BASE_URL}`);


app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await insertUser(username, email, password);
    res.status(201).send('User created successfully!');
  } catch (err) {
    res.status(500).send('Error creating user: ' + err.message);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, full_name: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const interests = await getUserInterests(user.id);
    const firstLogin = !interests || interests.length === 0;

    res.status(200).json({ message: 'Login successful', token, firstLogin, tags: interests });
  } catch (error) {
    res.status(500).send('Server error: ' + error.message);
  }
});

app.post('/profile', async (req, res) => {
  const { userId, profilePicture, bio } = req.body;
  try {
    await insertUserProfile(userId, profilePicture, bio);
    res.status(201).send('User profile created successfully!');
  } catch (err) {
    res.status(500).send('Error creating user profile: ' + err.message);
  }
});

app.put('/profile/:userId', upload.single('profile_picture'), async (req, res) => {
  const { userId } = req.params;
  let validInterests = [];

  try {
    const existing = await getUserProfile(userId);
    if (!existing) return res.status(404).send('User not found');

    const bio = req.body.bio || existing.bio || '';
    const name = req.body.name || existing.name || null;
    let profilePicture = existing.profile_picture;

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'profile_pictures' },
        (err, result) => {
          if (err) {
            console.error('Cloudinary upload failed:', err);
            return res.status(500).send('Cloudinary upload failed');
          }
          profilePicture = result.secure_url;
          finalizeUpdate();
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      finalizeUpdate();
    }

    async function finalizeUpdate() {
      await updateUserProfile(userId, profilePicture, bio, name);

      if (req.body.interests) {
        try {
          const parsed = JSON.parse(req.body.interests);
          if (Array.isArray(parsed)) {
            validInterests = parsed.filter(tag => typeof tag === 'string' && tag.trim() !== '');
          }
        } catch (err) {
          console.warn("Couldn't parse interests:", err.message);
        }

        await pool.query(`DELETE FROM user_interests WHERE user_id = $1`, [userId]);

        for (const tag of validInterests) {
          await pool.query(
            `INSERT INTO user_interests (user_id, interest) VALUES ($1, $2)`,
            [userId, tag.trim()]
          );
        }
      }

      res.status(200).json({ message: 'Profile updated successfully!', profilePicture });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await getUserProfile(userId);
    if (!profile) return res.status(404).send('Profile not found');

    const tags = await getUserInterests(userId);

    res.status(200).json({
      user_id: profile.user_id,
      username: profile.username,
      name: profile.name,
      profile_picture: profile.profile_picture,
      bio: profile.bio,
      tags,
    });
  } catch (err) {
    res.status(500).send('Error fetching profile: ' + err.message);
  }
});

app.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Authorization token is missing');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const profile = await getUserProfile(userId);
    if (!profile) return res.status(404).send('Profile not found');

    const tags = await getUserInterests(userId);

    res.status(200).json({
      user_id: profile.user_id,
      username: profile.username,
      profile_picture: profile.profile_picture,
      bio: profile.bio,
      tags,
    });
  } catch (err) {
    res.status(500).send('Error fetching profile: ' + err.message);
  }
});

app.post('/interests', async (req, res) => {
  const { userId, interests } = req.body;
  try {
    await insertUserInterests(userId, interests);
    res.status(201).send('Interests added successfully!');
  } catch (err) {
    res.status(500).send('Error adding interests: ' + err.message);
  }
});

app.get('/interests/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const interests = await getUserInterests(userId);
    res.status(200).json(interests);
  } catch (err) {
    res.status(500).send('Error fetching interests: ' + err.message);
  }
});

app.post('/posts', upload.single('image'), async (req, res) => {
  const { title, content, user_id } = req.body;
  let image_url = '';
  let tags = '[]'; // Default to empty array JSON string

  try {
    if (req.body.tags) {
      try {
        tags = JSON.stringify(JSON.parse(req.body.tags)); // Force valid JSON
      } catch {
        console.warn("⚠️ Couldn't parse tags. Saving as empty array.");
      }
    }


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

    // ✅ Upload image if exists
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'post_images' },
          (err, result) => err ? reject(err) : resolve(result)
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      image_url = result.secure_url;
    }

    // ✅ 1. Create post
    const postId = await insertPost(title, content, image_url, user_id, tags);
     console.log("Creating chat with:", { postId, user_id });


    // ✅ 2. Auto-create group chat
    const chatId = await createChat('group', postId, user_id); 

    // ✅ 3. Add user to chat
    await addUserToChat(chatId, user_id);

    // ✅ 4. Notify users in the chat room 
    const io = req.app.get('io'); // Get the `io` instance
    io.to(chatId).emit('newChat', { chatId, postId, user_id });

    res.status(201).json({
      message: `Post created and group chat started!`,
      postId,
      chatId
    });

  } catch (err) {
    console.error('❌ Error creating post + chat:', err.message);
    res.status(500).json({ message: 'Error creating post/chat', error: err.message });
  }
});


app.get('/posts', async (req, res) => {
  try {
    const posts = await getPosts();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving posts', error: err.message });
  }
});

app.get('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM posts WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).send('Post not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Test route for creating a chat
app.post('/chats', async (req, res) => {
  const { type, post_id, user_id } = req.body;

  if (!type || !post_id || !user_id) {
    return res.status(400).json({ error: 'Missing required fields: type, post_id, or user_id' });
  }

  try {
    const chat_id = await createChat(type, post_id, user_id);
    await addUserToChat(chat_id, user_id); // Add creator to chat_users table

    res.status(201).json({ message: 'Chat created', chat_id });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});


// Test route for inserting a message
app.post('/message', async (req, res) => {
  const { chat_id, user_id, content } = req.body;
  try {
    const message_id = await insertMessage(chat_id, user_id, content);
    res.status(201).json({ message_id });
  } catch (error) {
    console.error('Error inserting message:', error);
    res.status(500).json({ error: 'Failed to insert message' });
  }
});

// Test route for getting messages from a chat
app.get('/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;

  const query = `
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
    const result = await pool.query(query, [chatId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/chats/:chat_id/users', async (req, res) => {
  const { chat_id } = req.params; 
  const { user_id } = req.body;  

  try {
    await addUserToChat(chat_id, user_id);  
    res.status(200).json({ message: 'User added to chat successfully' });
  } catch (error) {
    console.error('Error adding user to chat:', error);
    res.status(500).json({ error: 'Failed to add user to chat' });
  }
});

app.get('/user-chats/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT chats.*, posts.title
      FROM chats
      JOIN chat_users ON chats.id = chat_users.chat_id
      LEFT JOIN posts ON chats.post_id = posts.id
      WHERE chat_users.user_id = $1
      ORDER BY chats.created_at DESC
    `, [user_id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ error: 'Failed to fetch user chats' });
  }
});

app.get('/chat-users/:chat_id', async (req, res) => {
  const { chat_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT users.id, users.username, user_profiles.profile_picture
      FROM chat_users
      JOIN users ON users.id = chat_users.user_id
      LEFT JOIN user_profiles ON users.id = user_profiles.user_id
      WHERE chat_users.chat_id = $1
    `, [chat_id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching chat users:', err);
    res.status(500).json({ error: 'Failed to get users in chat' });
  }
});






