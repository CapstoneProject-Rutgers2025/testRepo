import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import { 
    createUsersTable,
    createUserProfilesTable, 
    insertUserProfile, 
    updateUserProfile,  // Now expects (userId, profilePicture, bio)
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://commonnground.netlify.app', // Allow requests only from your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    credentials: true, // Allow cookies and other credentials
}));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup Multer for profile image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Create the necessary database tables
createUsersTable();
populateUserProfiles();
createUserProfilesTable();
createUserInterestsTable();
createPostsTable();

// User signup endpoint
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        await insertUser(username, email, password);
        res.status(201).send('User created successfully!');
    } catch (err) {
        res.status(500).send('Error creating user: ' + err.message);
    }
});

// User login endpoint
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

        res.status(200).json({
            message: 'Login successful',
            token,
            firstLogin,
            tags: interests
        });
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});

// Create user profile endpoint
app.post('/profile', async (req, res) => {
    const { userId, profilePicture, bio, tags } = req.body;
    try {
        await insertUserProfile(userId, profilePicture, bio, tags);
        res.status(201).send('User profile created successfully!');
    } catch (err) {
        res.status(500).send('Error creating user profile: ' + err.message);
    }
});

// Update profile with profile picture (FormData support)
// This endpoint now updates only the profile picture and bio.
app.put('/profile/:userId', upload.single('profile_picture'), async (req, res) => {
    const { userId } = req.params;
    try {
        const existing = await getUserProfile(userId);
        if (!existing) return res.status(404).send('User not found');

        const bio = req.body.bio || existing.bio || '';
        const profilePicture = req.file
            ? `/uploads/${req.file.filename}`
            : existing.profile_picture;

        // Update only profile_picture and bio (do not update tags)
        await updateUserProfile(userId, profilePicture, bio);
        console.log(`Profile updated for user ${userId}: picture ${profilePicture}, bio ${bio}`);
        res.status(200).json({ message: 'Profile updated successfully!', profilePicture });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).send('Error updating profile: ' + err.message);
    }
});

// Get user profile endpoint (updated to include interests from user_interests)
app.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const profile = await getUserProfile(userId);
        if (!profile) return res.status(404).send('Profile not found');

        // Fetch interests from user_interests table and attach them as tags
        const interestsRows = await getUserInterests(userId);
        profile.tags = interestsRows.map(row => row.interest);

        res.status(200).json(profile);
    } catch (err) {
        res.status(500).send('Error fetching profile: ' + err.message);
    }
});

// Get user profile endpoint using JWT token
app.get('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) return res.status(401).send('Authorization token is missing');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token
        const userId = decoded.id; // Extract the userId from the token

        const profile = await getUserProfile(userId);
        if (!profile) return res.status(404).send('Profile not found');

        // Fetch interests from user_interests table and attach them as tags
        const interestsRows = await getUserInterests(userId);
        profile.tags = interestsRows.map(row => row.interest);

        res.status(200).json(profile);
    } catch (err) {
        res.status(500).send('Error fetching profile: ' + err.message);
    }
});

// Add user interests endpoint (with extra logging)
app.post('/interests', async (req, res) => {
    const { userId, interests } = req.body;
    console.log("POST /interests received:", req.body);
    try {
        await insertUserInterests(userId, interests);
        console.log(`Interests inserted for user ${userId}:`, interests);
        res.status(201).send('Interests added successfully!');
    } catch (err) {
        console.error("Error in POST /interests:", err);
        res.status(500).send('Error adding interests: ' + err.message);
    }
});

// Get user interests endpoint
app.get('/interests/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const interests = await getUserInterests(userId);
        res.status(200).json(interests);
    } catch (err) {
        res.status(500).send('Error fetching interests: ' + err.message);
    }
});

// Create a post endpoint
app.post('/posts', async (req, res) => {
    const { title, content, image_url, user_id } = req.body;
    try {
        const postId = await insertPost(title, content, image_url, user_id);
        res.status(201).json({ message: 'Post created successfully', postId });
    } catch (err) {
        res.status(500).json({ message: 'Error creating post', error: err.message });
    }
});

// Get all posts endpoint
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
