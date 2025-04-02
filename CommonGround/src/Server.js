import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
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
    populateUserProfiles
} from './concepts/Queries.js';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Setting up Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Upload Profile Picture
app.post('/upload', upload.single('profilePicture'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        await insertUser(username, email, password);
        res.status(201).send('User created successfully!');
    } catch (err) {
        res.status(500).send('Error creating user: ' + err.message);
    }
});

// Login Route
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
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});

// Create Tables
createUserProfilesTable();
populateUserProfiles();
createUserInterestsTable();
createPostsTable();

// Profile Routes
app.post('/profile', async (req, res) => {
    const { userId, profilePicture, bio, tags, activeGroups, inactiveGroups } = req.body;
    try {
        await insertUserProfile(userId, profilePicture, bio, tags, activeGroups, inactiveGroups);
        res.status(201).send('User profile created successfully!');
    } catch (err) {
        res.status(500).send('Error creating user profile: ' + err.message);
    }
});

app.put('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const { profilePicture, bio, tags, activeGroups, inactiveGroups } = req.body;
    try {
        await updateUserProfile(userId, profilePicture, bio, tags, activeGroups, inactiveGroups);
        res.status(200).send('Profile updated successfully!');
    } catch (err) {
        res.status(500).send('Error updating profile: ' + err.message);
    }
});

app.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const profile = await getUserProfile(userId);
        profile ? res.status(200).json(profile) : res.status(404).send('Profile not found');
    } catch (err) {
        res.status(500).send('Error fetching profile: ' + err.message);
    }
});

// Interests Routes
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

// Posts Routes
app.post('/posts', async (req, res) => {
    const { title, content, image_url, user_id } = req.body;
    try {
        const postId = await insertPost(title, content, image_url, user_id);
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
