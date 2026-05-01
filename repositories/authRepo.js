const { DatabaseError } = require('../errors/error');
const db = require('../config/db');
const { hashToken, verifyToken } = require('../utils/hash')



async function create(user)
{
    const { user_id, email, passwordHash, role_id } = user;

    const connection = await db.getConnection();

    
    try {
        await connection.beginTransaction();

        const [insertResult] = await connection.query(
            `INSERT INTO users (user_id, email, password_hash)
            VALUES(?,?,?)`, [user_id, email, passwordHash]
        )

        const id = insertResult.insertId;

        await connection.query(
            `
            INSERT INTO user_roles(user_id, role_id) 
            VALUES (?, ?)
            `, [id, role_id]
        )


        await connection.commit()

        return insertResult.insertId;

    } catch (error) {
        console.error(error.message);
        throw new DatabaseError;
    }
    finally {
        connection.release();
    }

   
}

async function fetchByEmail (email)
{
    
    try {
        const [user] = await db.query(
            `SELECT 
                u.id,
                u.user_id,
                u.email,
                u.password_hash,
                r.name AS role
                FROM users u 
                JOIN user_roles ur
                    ON u.id = ur.user_id
                JOIN roles r
                    ON ur.role_id = r.id
                WHERE u.email = ?             
            `, [email]
        )        

        return user;

    } catch (error) {
        console.error(error.message);
        throw new DatabaseError();
    }
}

async function fetchById (id)
{
    try {
        const [user] = await db.query(
            `
            SELECT 
                u.user_id,
                u.email,
                r.name AS role
                FROM users u
                JOIN user_roles ur
                    ON u.id = ur.user_id
                JOIN roles r
                    ON r.id = ur.role_id
                WHERE u.id = ?
            `, [id]
        )

        return user;

    } catch (error) {
        console.error(error.message);
        throw new DatabaseError();
    }
}

async function deleteById (id)
{
    try {
        const [ result ] = await db.query('DELETE FROM users WHERE id = ?', [id]);

        return result.affectedRows;

    } catch (error) {
        console.error(error);
        throw new DatabaseError();
    }
}



 async function addRefreshToken (token_hash, id, expires_at)
 {
    try {
        const [ result ] = await db.query(
            `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
            VALUES (?,?,?)
            `, [id, token_hash, expires_at]
        )

        return result.insertId;

    } catch (error) {
        console.error(error.message);
        throw new DatabaseError();
    }
 }



async function fetchTokenHash (id){
    try {
        const [result] = await db.query ('SELECT id, token_hash, expires_at, revoked  FROM refresh_tokens WHERE user_id = ?', [id])

        return result;

    } catch (error)
    {
        console.error(error.message);
        throw new DatabaseError();
    }
}


async function revokeToken (id){
    try {
        const [result] = await db.query('UPDATE refresh_tokens SET revoked = 1 WHERE  user_id = ?', [id])

        return result.affectedRows;

    } catch (error) {
        console.error(error.message);
        throw new DatabaseError()
    }
}


async function logActvity(id, event_type, ip_address) {
    try {
        const [ result ] = await db.query(
            `
            INSERT INTO auth_logs
            (user_id, event_type, ip_address)
            VALUES (?,?,?)
            `, [id, event_type, ip_address]
        )

        return result.insertId;

    } catch (error) {
        console.error(error.message);
        throw new DatabaseError();
    }
}






module.exports = {
    create,
    fetchByEmail,
    fetchById,
    deleteById,
    addRefreshToken,
    fetchTokenHash,
    revokeToken,
    logActvity
};