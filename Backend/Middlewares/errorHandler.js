const logger = require('../utils/logger');
const { sendError } = require('../utils/response');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    logger.error("Server error", {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // 1. Handle Malformed JSON SyntaxError
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return sendError(res, "Invalid JSON payload", 400);
    }

    // 2. Operational / Custom AppErrors
    if (err instanceof AppError || err.statusCode) {
        return sendError(res, err, err.statusCode, err.details);
    }

    // 3. Mongoose CastError
    if (err.name === "CastError") {
        return sendError(res, "Resource not found", 404);
    }

    // 4. Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'Field';
        return sendError(res, `${field} already exists`, 400);
    }

    // 5. Mongoose ValidationError
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        return sendError(res, "Validation failed", 400, errors);
    }

    // 6. JWT Errors
    if (err.name === "JsonWebTokenError") {
        return sendError(res, "Invalid token", 401);
    }
    if (err.name === "TokenExpiredError") {
        return sendError(res, "Token expired", 401);
    }

    // 7. Unexpected/System Errors (Mask in production)
    const message = isProduction ? "Internal server error" : err.message;
    const safeError = new Error(message);
    if (!isProduction) {
        safeError.stack = err.stack;
    }
    return sendError(res, safeError, 500);
};

const notFound = (req, res) => {

    logger.warn("Route not found", {
        url: req.originalUrl
    });

    return sendError(
        res,
        "Route not found",
        404
    );
};

module.exports = {
    errorHandler,
    notFound
};