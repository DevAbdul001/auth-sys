const jwt = require('jsonwebtoken');

function generateAccessToken (payload)
{
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
        algorithm:'HS256'
    })
}

function generateRefreshToken (payload){
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            algorithm: 'HS256'
        }
    )
}

function verifyAccessToken (token){
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Failed to verify Access token', error.message)
        return null;
    }
}

function verifyRefreshToken (token){
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        console.error('Failed to verify refresh token', error.message);
        return null;
    }
}


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}