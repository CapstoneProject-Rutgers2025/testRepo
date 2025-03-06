import { createUsersTable } from './concepts/Queries.js';
import { insertUser } from './concepts/Queries.js';
import express from 'express';
import bodyParser from 'body-parser';


//setting up express
const app = express();
const port = process.env.PORT || 3000;

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