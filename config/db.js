const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testConnection(attempts = 5, delayMs = 3000) {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log(' Successfully connected to the database!');
    } catch (error) {
        if (error.code === 'ECONNREFUSED' && attempts > 1) {
            console.warn(` Database not ready yet. Retrying in ${delayMs / 1000}s... (${attempts - 1} attempts left)`);
            await delay(delayMs);
            return testConnection(attempts - 1, delayMs); 
        }
        
        console.error(' Database connection failed completely:');
        console.error(error);
        throw error; 
    }
}

testConnection().catch(() => {
    process.exit(1);
});

module.exports = pool;