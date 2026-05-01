class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}


class ConflictError extends AppError {
    constructor (message = 'Resource conflict'){
        super(message, 409);
    }
}

class DatabaseError extends AppError {
    constructor( message = 'Database operation failed') {
        super(message, 500)
    }
}

class NotFoundError extends AppError {
    constructor( message = 'Resource not found') {
        super(message, 404)
    }
}

class ValidationError extends AppError {
    constructor( message = ' Invalid input') {
        super(message, 400)
    }
}


module.exports = {
    AppError,
    ConflictError,
    DatabaseError,
    NotFoundError,
    ValidationError
}