import { createUsersTable } from './concepts/Queries.js';
import { insertUser } from './concepts/Queries.js';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { pool } from './db/db.js';
import bcrypt from 'bcrypt';

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

// login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email }, '8f7b592f27d6a8f611fb72cdcb0a220d3669278c76fd9e0f5a0fba9cffd73a3cd0227b7a45834c693b7d203404bf2fe3f1d1eaff4f6b013ed8b29d82546909ff', { expiresIn: '1h' });
        res.status(200).json({ token });
      } else {
        res.status(401).send('Invalid email or password');
      }
    } catch (err) {
      res.status(500).send('Error logging in: ' + err.message);
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