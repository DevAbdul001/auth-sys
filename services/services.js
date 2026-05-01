const { email } = require('zod');
const {  ConflictError, ValidationError, NotFoundError } = require('../errors/error')
const authRepo = require('../repositories/authRepo');
const { validateUserId, validateEmail, validateToken } = require('../utils/validator')


async function create(user)
{
    
    const [ exists ]= await authRepo.fetchByEmail(user.email);

    if(exists)
    {
        throw new ConflictError("Email already exists");
        return null;
    }

    const insertResult = await authRepo.create(user)
    return insertResult;
}


async function fetchByEmail(email)
{
    const exists = await authRepo.fetchByEmail(email);

    if(!exists)
    {
        throw new NotFoundError('Email not registered');
    }

    const user = await authRepo.fetchByEmail(email);
    return user[0];
}


async function fetchById (user_id)
{
    const exists = await validateUserId(user_id);

    if(!exists)
    {
        return null;
    }

    const user = await authRepo.fetchById(exists.id)
    return user[0];
}

async function deleteById(user_id) {
    const exists = await validateUserId(user_id);

    return authRepo.deleteById(exists.id);
}


async function addRefreshToken(token_hash, id, expires_at)
{
    
    const [exists] = await authRepo.fetchTokenHash(id)

    if(exists){
        await authRepo.revokeToken(id);
    }

    await authRepo.addRefreshToken(token_hash,id, expires_at);

}

async function fetchTokenHash (user_id)
{
    const user = await validateUserId(user_id);

    return result = await authRepo.fetchTokenHash(user.id)
}

async function revokeToken (user_id)
{
    const user = await validateUserId(user_id);

    return result = await authRepo.revokeToken(user.id);
}

async function logActvity(user_id, event_type, ip_address)
{
    
    const user = await validateUserId(user_id);

    return result = await authRepo.logActvity(user.id, event_type, ip_address);

}


module.exports = {
    create,
    fetchByEmail,
    fetchById,
    addRefreshToken,
    fetchTokenHash,
    revokeToken,
    logActvity,
    deleteById
}