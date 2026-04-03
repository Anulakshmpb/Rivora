/**
 * Standardized Response Utilities
 */

const sendSuccess = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const sendError = (res, message, statusCode = 500, details = null) => {
    const response = {
        success: false,
        message,
    };
    if (details) response.details = details;
    return res.status(statusCode).json(response);
};

const sendValidationError = (res, details) => {
    return sendError(res, "Validation Error", 400, details);
};

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
};
