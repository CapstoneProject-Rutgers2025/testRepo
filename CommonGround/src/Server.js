import { createUsersTable } from './concepts/Queries.js';
import { insertUser } from './concepts/Queries.js';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { pool } from './db/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv'
import { getUserByEmail } from './concepts/Queries.js';
import { createUserProfilesTable, insertUserProfile, updateUserProfile, getUserProfile } from './concepts/Queries.js';

//setting up express
const app = express();
const port = process.env.PORT || 3000;

// use cors middlware
app.use(cors());
//setting up app parameters
app.use(bodyParser.json());
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
        // Fetch the user by email
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        // Generate a JWT token
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

// Create the user_profiles table
createUserProfilesTable();

// Route to user profile
app.post('/profile', async (req, res) => {
    const { userId, profilePicture, description } = req.body;
    try {
        await insertUserProfile(userId, profilePicture, description);
        res.status(201).send('Profile created successfully!');
    } catch (err) {
        res.status(500).send('Error creating profile: ' + err.message);
    }
});

// Route to update profile
app.put('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const { profilePicture, description } = req.body;
    try {
        await updateUserProfile(userId, profilePicture, description);
        res.status(200).send('Profile updated successfully!');
    } catch (err) {
        res.status(500).send('Error updating profile: ' + err.message);
    }
});

// Route to fetch profile
app.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const profile = await getUserProfile(userId);
        if (profile) {
            res.status(200).json(profile);
        } else {
            res.status(404).send('Profile not found');
        }
    } catch (err) {
        res.status(500).send('Error fetching profile: ' + err.message);
    }
});


//setting up the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//Testing Queries
async function testQueries() {
    try {
       //await createUsersTable();

      //Testing insertUser
        //await insertUser('Abdalrhman', 'as@gmail.com', '123');
        //await insertUser('Eric', 'Eric@gmail.com', '1234')
        //await insertUser('Yusra', 'Yusra@gmail.com', '12345')
        //await insertUser('Elijah', 'Elijah@gmail.com', '123456')
        //await insertUser('Andrew', 'Andrew@gmail.com', '1234567')
    } catch (err) {
        console.error('Error creating user!', err);
    }
}

async function runAllQueries() {
    await testQueries();
}
testQueries();