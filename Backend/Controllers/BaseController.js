const { sendSuccess, sendError, sendValidationError } = require('../utils/response');
const { ValidationError, ApiError } = require('../utils/errors');
const logger = require('../utils/logger');

class BaseController {

    /* ================================
       ASYNC ERROR HANDLER
    ================================= */
    static asyncHandler(fn) {
        return async (req,res,next)=>{
            const start = Date.now();
            try{
 await fn(req,res,next);
                const duration = Date.now() - start;
                logger.info("Request completed",{
                    method:req.method,
                    url:req.originalUrl,
                    status:res.statusCode,
                    duration:`${duration}ms`,
                    user:req.user?.id || null
                });
            }catch(error){
                logger.error("Request failed",{
                    error:error.message,
                    details:error.details || null,
                    method:req.method,
                    url:req.originalUrl
                });
                next(error);
            }
        }
    }


    /* ================================
       VALIDATION
    ================================= */
    static validateRequest(schema,data){
        const {error,value} = schema.validate(data,{
            abortEarly:false,
            stripUnknown:true,
            convert:true
        });
        if(error){
            throw new ValidationError(
                "Validation failed",
                error.details.map(e=>({
                    field:e.path.join('.'),
                    message:e.message
                }))
            );
        }
        return value;
    }


    /* ================================
       SUCCESS RESPONSE
    ================================= */
    static sendSuccess(
        res,
        message,
        data=null,
        statusCode=200,
        meta=null
    ){
        return sendSuccess(
            res,
            message,
            data,
            statusCode,
            meta
        );
    }

    /* ================================
       ERROR RESPONSE
    ================================= */
    static sendError(
        res,
        message,
        statusCode=500,
        details=null
    ){
        return sendError(
            res,
            message,
            statusCode,
            details
        );
    }


    /* ================================
       VALIDATION ERROR FORMAT
    ================================= */
    static handleValidationError(res,error){
        return sendValidationError(
            res,
            error.details || error.message
        );
    }


    /* ================================
       PAGINATION (SAFE VERSION)
    ================================= */
    static getPaginationOptions(query){
        const page =
            Math.max(parseInt(query.page)||1,1);
        const limit =
            Math.min(
                parseInt(query.limit)||10,
                100
            );
        const skip = (page-1)*limit;
        return {
            page,
            limit,
            skip
        };
    }


    /* ================================
       PAGINATION METADATA
    ================================= */
    static buildPaginationMeta(
        page,
        limit,
        total
    ){
        return {
            page,
            limit,
            total,
            totalPages:Math.ceil(total/limit),
            hasNext:page < Math.ceil(total/limit),
            hasPrev:page>1
        };
    }

    /* ================================
       USER SANITIZATION
    ================================= */
    static sanitizeUser(user){
        if(!user) return null;
        const obj = user.toObject ? user.toObject():{...user};
        const restrictedFields=[
            "password",
            "__v",
            "verificationOTP",
            "otpExpires",
            "resetPasswordToken",
            "resetPasswordExpires"
        ];
        restrictedFields.forEach(field=>delete obj[field]);
        return obj;
    }


    /* ================================
       GENERIC SANITIZER
    ================================= */
    static sanitize(data,fields=[]){
        const obj={...data};
        fields.forEach(field=>{
            delete obj[field];
        });
        return obj;
    }
    /* ================================
       AUDIT LOGGING
    ================================= */
    static logAction(
        action,
        req,
        details={}
    ){
        const logData={
            action,
            method:req?.method,
            endpoint:req?.originalUrl,
            ip:req?.ip,
            userAgent:req?.headers['user-agent'],
            user:req?.user?.id || null,
            timestamp:new Date().toISOString(),
            ...details
        };
        logger.info(action,logData);
    }


    /* ================================
       FILTER BUILDER
    ================================= */
    static buildFilterQuery(query,allowedFilters=[]){
        const filter={};
        allowedFilters.forEach(field=>{
            if(query[field]!==undefined){
                filter[field]=query[field];
            }
        });
        return filter;
    }


    /* ================================
       SEARCH HELPER
    ================================= */
    static buildSearchQuery(
        searchTerm,
        fields=[]
    ){
        if(!searchTerm) return {};
        return {
            $or:fields.map(field=>({
                [field]:{
                    $regex:searchTerm,
                    $options:"i"
                }
            }))
        };
    }


    /* ================================
       STANDARD RESPONSES
    ================================= */
    static sendNotFound(
        res,
        resource="Resource"
    ){
        return this.sendError(
            res,
            `${resource} not found`,
            404
        );
    }


    static sendUnauthorized(
        res,
        message="Unauthorized"
    ){
        return this.sendError(
            res,
            message,
            401
        );
    }


    static sendForbidden(
        res,
        message="Forbidden"
    ){
        return this.sendError(
            res,
            message,
            403
        );
    }


    /* ================================
       SERVICE RESPONSE HANDLER
    ================================= */
    static handleServiceResult(
        res,
        result,
        successMessage="Success"
    ){
        if(!result){
            return this.sendNotFound(res);
        }
        return this.sendSuccess(
            res,
            successMessage,
            result
        );
    }


}

module.exports = BaseController;