import { createUsersTable } from './concepts/Queries.js';
import { insertUser } from './concepts/Queries.js';

//Testing Queries
async function testQueries() {
    try {
      //  await createUsersTable();

      // Testing insertUser
        await insertUser('Abdalrhman', 'as@gmail.com', '123');
        await insertUser('Eric', 'Eric@gmail.com', '1234')
        await insertUser('Yusra', 'Yusra@gmail.com', '12345')
        await insertUser('Elijah', 'Elijah@gmail.com', '123456')
        await insertUser('Andrew', 'Andrew@gmail.com', '1234567')
    } catch (err) {
        console.error('Error creating user!', err);
    }
}

async function runAllQueries() {
    await testQueries();
}
testQueries();