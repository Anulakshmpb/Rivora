const User = require('../Modals/User');
const { verifyUserToken, verifyAdminToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

const extractToken = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    // Try to extract from cookie if header is missing
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }

    return null;
};

const findUser = async (id) => {
    return await User.findById(id).select("-password");
};

const authenticateUser = async (req, res, next) => {
    try {

        const token = extractToken(req);

        if (!token)
            return sendError(res, "Access token required", 401);

        const decoded = verifyUserToken(token);

        const user = await findUser(decoded.id);

        if (!user)
            return sendError(res, "User not found", 401);

        if (user.status === "banned")
            return sendError(res, "Account banned", 403);

        req.user = user;

        return next();

    } catch (error) {

        logger.error("Auth error", {
            error: error.message,
            url: req.originalUrl,
            ip: req.ip
        });
        res.clearCookie('token');
        return sendError(res, "Invalid or expired token", 401);
    }
};

const Admin = require('../Modals/Admin');

const findAdmin = async (id) => {
    return await Admin.findById(id).select("-password");
};

const authenticateAdmin = async (req, res, next) => {
    try {

        const token = extractToken(req);

        if (!token)
            return sendError(res, "Admin token required", 401);

        const decoded = verifyAdminToken(token);

        const admin = await findAdmin(decoded.id);

        if (!admin)
            return sendError(res, "Admin not found", 403);

        if (admin.role !== "admin")
            return sendError(res, "Not authorized", 403);

        if (admin.status === "banned")
            return sendError(res, "Admin banned", 403);

        req.admin = admin;

        next();

    }
    catch (error) {

        logger.error("Admin auth failed", {
            error: error.message
        });

        return sendError(res, "Invalid admin token", 401);
    }
};

const requireAdmin = (req, res, next) => {

    if (!req.user)
        return sendError(res, "Authentication required", 401);

    if (req.user.role !== "admin")
        return sendError(res, "Admin only route", 403);

    next();
};

const authenticateUserOrAdmin = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) return sendError(res, "Authentication token required", 401);

        const fs = require('fs');
        fs.appendFileSync('debug.log', `--- Auth Debug ---\nToken present: ${!!token}\n`);

        try {
            const decodedAdmin = verifyAdminToken(token);
            fs.appendFileSync('debug.log', `Admin Token Decoded: ${JSON.stringify(decodedAdmin)}\n`);
            const admin = await findAdmin(decodedAdmin.id);
            if (admin && admin.status !== "banned") {
                req.admin = admin;
                fs.appendFileSync('debug.log', `Auth Success: Admin ${admin._id}\n`);
                return next();
            }
            fs.appendFileSync('debug.log', `Admin not found or banned: ${decodedAdmin.id}\n`);
        } catch (adminErr) {
            fs.appendFileSync('debug.log', `Admin Verify Failed: ${adminErr.message}\n`);
        }

        try {
            const decodedUser = verifyUserToken(token);
            fs.appendFileSync('debug.log', `User Token Decoded: ${JSON.stringify(decodedUser)}\n`);
            const user = await findUser(decodedUser.id);
            if (user && user.status !== "banned") {
                req.user = user;
                fs.appendFileSync('debug.log', `Auth Success: User ${user._id}\n`);
                return next();
            }
            fs.appendFileSync('debug.log', `User not found or banned: ${decodedUser.id}\n`);
        } catch (userErr) {
            fs.appendFileSync('debug.log', `User Verify Failed: ${userErr.message}\n`);
        }
        res.clearCookie('token');
        return sendError(res, "Invalid or expired token", 401);
    } catch (error) {
        const fs = require('fs');
        fs.appendFileSync('debug.log', `Combined Auth Error: ${error.message}\n`);
        logger.error("Combined auth error", { error: error.message });
        return sendError(res, "Authentication failed", 401);
    }
};

module.exports = {
    authenticateUser,
    authenticateAdmin,
    requireAdmin,
    authenticateUserOrAdmin
};