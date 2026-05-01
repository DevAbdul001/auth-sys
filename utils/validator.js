const { NotFoundError,  DatabaseError, ValidationError } = require('../errors/error')
const db = require('../config/db')

//Validate user id
async function validateUserId(userId) {
    const [rows] = await db.query(
        `SELECT id FROM users WHERE user_id = ?`,
        [userId]
    );

    if (rows.length === 0) {
        throw new NotFoundError('User not found');
    }

    return rows[0]; 
}


async function validateEmail (email)
{
    try {
        const [ user ] = await db.query (
            `
            SELECT id FROM users
            WHERE email = ?
            `, [email]
        )

        if(user.length === 0)
        {
            throw new NotFoundError('Email doesnt exist')
            return null;
        }

        return user;

    } catch (error) {
        console.error(error.message);
    }
}


async function validateToken (id)
{
    try {
        const [rows] = await db.query(
            `
            SELECT token_hash, revoked, expires_at
            FROM refresh_tokens
            WHERE user_id = ?
                AND revoked = 0
                AND expires_at > NOW()
            `,
            [id]
            );

            if (rows.length === 0) {
            throw new ValidationError('Invalid token');
            }

        return exists[0]
    } catch (error) {
        console.error(error.message);
    }
}


module.exports = {
    validateUserId,
    validateEmail,
    validateToken
}