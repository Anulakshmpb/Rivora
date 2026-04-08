const User = require('../models/User');
const { verifyUserToken, verifyAdminToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

const extractToken = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return null;

    if (!authHeader.startsWith("Bearer "))
        return null;

    return authHeader.split(" ")[1];
};

const findUser = async (id) => {
    return await User.findById(id).select("-password");
};

const authenticateUser = async (req, res, next) => {
    try {

        const token = extractToken(req);

        if (!token)
            return sendError(res,"Access token required",401);

        const decoded = verifyUserToken(token);

        const user = await findUser(decoded.id);

        if (!user)
            return sendError(res,"User not found",401);

        if (user.status === "banned")
            return sendError(res,"Account banned",403);

        req.user = user;

        return next();

    } catch (error) {

        logger.error("Auth error",{
            error: error.message,
            url:req.originalUrl,
            ip:req.ip
        });

        return sendError(res,"Invalid or expired token",401);
    }
};

const authenticateAdmin = async (req,res,next)=>{
    try{

        const token = extractToken(req);

        if(!token)
            return sendError(res,"Admin token required",401);

        const decoded = verifyAdminToken(token);

        const admin = await findUser(decoded.id);

        if(!admin)
            return sendError(res,"Admin not found",403);

        if(admin.role !== "admin")
            return sendError(res,"Not authorized",403);

        if(admin.status === "banned")
            return sendError(res,"Admin banned",403);

        req.admin = admin;

        next();

    }
    catch(error){

        logger.error("Admin auth failed",{
            error:error.message
        });

        return sendError(res,"Invalid admin token",401);
    }
};

const requireAdmin = (req,res,next)=>{

    if(!req.user)
        return sendError(res,"Authentication required",401);

    if(req.user.role !== "admin")
        return sendError(res,"Admin only route",403);

    next();
};

module.exports={
    authenticateUser,
    authenticateAdmin,
    requireAdmin
};