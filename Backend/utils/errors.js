/**
 * Custom Error Classes for the Backend
 */

class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends ApiError {
    constructor(message, details = null) {
        super(message, 400);
        this.name = 'ValidationError';
        this.details = details;
    }
}

class NotFoundError extends ApiError {
    constructor(message = "Resource not found") {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

module.exports = {
    ApiError,
    ValidationError,
    NotFoundError,
};
