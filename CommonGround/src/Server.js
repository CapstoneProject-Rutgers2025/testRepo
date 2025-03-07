import { createUsersTable } from './concepts/Queries.js';
import { insertUser } from './concepts/Queries.js';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


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
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
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