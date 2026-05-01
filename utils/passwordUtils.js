const argon = require ('argon2');

async function hashPassword (password) {
    const password_hash = await argon.hash(password);
    return password_hash;
}

async function verifyPassword (hashedPassword, password){
    return argon.verify(hashedPassword, password)
}

module.exports = {
    hashPassword,
    verifyPassword
}