const logger = require('../utils/logger');
const { sendError } = require('../utils/response');
const { AppError } = require('../utils/errors');

const errorHandler = (err,req,res,next)=>{

    logger.error("Server error",{

        message:err.message,
        stack:err.stack,
        url:req.originalUrl,
        method:req.method,
        ip:req.ip

    });

    if(err instanceof AppError)
        return sendError(res, err.message, err.statusCode, err.details);

    if(err.name === "CastError")
        return sendError(res,"Resource not found",404);

    if(err.code === 11000){

        const field = Object.keys(err.keyValue)[0];

        return sendError(
            res,
            `${field} already exists`,
            400
        );
    }

    if(err.name === "ValidationError"){

        const errors = Object.values(err.errors).map(e=>({

            field:e.path,
            message:e.message

        }));

        return sendError(
            res,
            "Validation failed",
            400,
            errors
        );
    }

    if(err.name === "JsonWebTokenError")
        return sendError(res,"Invalid token",401);

    if(err.name === "TokenExpiredError")
        return sendError(res,"Token expired",401);

    return sendError(
        res,
        "Internal server error",
        500
    );
};

const notFound = (req,res)=>{

    logger.warn("Route not found",{
        url:req.originalUrl
    });

    return sendError(
        res,
        "Route not found",
        404
    );
};

module.exports={
    errorHandler,
    notFound
};