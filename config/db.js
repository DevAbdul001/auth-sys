const mysql = require ('mysql2/promise');
require('dotenv').config();


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port : process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function testConnection (){
    try {
        const [ rows ] = await pool.query('SELECT 1 + 1 AS result');
    } catch (error) {
        console.error(error)
    }
}

testConnection()

module.exports = pool;