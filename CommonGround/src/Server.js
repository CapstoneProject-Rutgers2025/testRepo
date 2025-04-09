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
} from './concepts/Queries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http:localhost:5173','https://commonnground.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(bodyParser.json());

// ✅ Use memoryStorage for Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Auto-create tables
createUsersTable();
createUserProfilesTable();
createUserInterestsTable();
createPostsTable();

// ===== Routes ===== //

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
      console.log("📷 Uploading to Cloudinary...");
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
      console.log("✅ Updated profile with bio, name, and picture.");

      if (req.body.interests) {
        try {
          const parsed = JSON.parse(req.body.interests);
          if (Array.isArray(parsed)) {
            validInterests = parsed.filter(tag => typeof tag === 'string' && tag.trim() !== '');
          }
        } catch (err) {
          console.warn("⚠️ Couldn't parse interests:", err.message);
        }

        await pool.query(`DELETE FROM user_interests WHERE user_id = $1`, [userId]);

        for (const tag of validInterests) {
          await pool.query(
            `INSERT INTO user_interests (user_id, interest) VALUES ($1, $2)`,
            [userId, tag.trim()]
          );
          console.log(`✅ Inserted interest: "${tag.trim()}"`);
        }
      }

      res.status(200).json({
        message: 'Profile updated successfully!',
        profilePicture,
      });
    }
  } catch (err) {
    console.error("❌ Error updating profile:", err.stack);
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
    console.error('Error fetching profile:', err);
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

app.post('/posts', async (req, res) => {
  const { title, content, image_url, user_id, tags } = req.body;
  try {
    const postId = await insertPost(title, content, image_url, user_id, tags);
    res.status(201).json({ message: 'Post created successfully', postId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating post', error: err.message });
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

