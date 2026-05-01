const { ValidationError } = require('../errors/error');
const { generateId } = require('../utils/idUtils');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class User{
    constructor(email, passwordHash, role_id=2)
    {
        this.validate(email)

        this.user_id = generateId();
        this.email = email; 
        this.passwordHash = passwordHash;
        this.role_id = role_id
    }

    validate(email)
    {
        if(!emailRegex.test(email)){
            throw new ValidationError('Invalid email format');
        }
    }
}

module.exports = User;