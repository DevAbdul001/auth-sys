const { ValidationError } = require('../errors/error');
const { generateId } = require('../utils/idUtils');
const { UserSchema } = require('../schemas/user.schema');

class User {
    constructor(email, passwordHash, role_id = 2) {
        const validated = this.validate({ email, passwordHash, role_id });

        this.user_id = generateId();
        this.email = validated.email;
        this.passwordHash = validated.passwordHash;
        this.role_id = validated.role_id;
    }

    validate(data) {
        const result = UserSchema.safeParse(data);

        if (!result.success) {
            const message = result.error.errors[0]?.message || "Validation failed";
            throw new ValidationError(message);
        }

        return result.data;
    }
}

module.exports = User;
