const User = require('../Modals/User');
const { verifyUserToken, verifyAdminToken: jwtVerifyAdminToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

const extractToken = (req, type) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            if (type === 'admin') {
                jwtVerifyAdminToken(token);
                return token;
            } else if (type === 'user') {
                verifyUserToken(token);
                return token;
            } else {
                try {
                    verifyUserToken(token);
                    return token;
                } catch {
                    jwtVerifyAdminToken(token);
                    return token;
                }
            }
        } catch (err) {
            // Header token is not of the requested type; fall back to cookies
        }
    }

    if (req.cookies) {
        if (type === 'admin' && req.cookies.admin_token) return req.cookies.admin_token;
        if (type === 'user' && req.cookies.user_token) return req.cookies.user_token;
        if (req.cookies.token) return req.cookies.token;
    }

    return null;
};

const findUser = async (id) => {
    return await User.findById(id).select("-password");
};

const authenticateUser = async (req, res, next) => {
    try {

        const token = extractToken(req, 'user');

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
        res.clearCookie('user_token');
        return sendError(res, "Invalid or expired token", 401);
    }
};

const Admin = require('../Modals/Admin');

const findAdmin = async (id) => {
    return await Admin.findById(id).select("-password");
};

const authenticateAdmin = async (req, res, next) => {
    try {

        const token = extractToken(req, 'admin');

        if (!token)
            return sendError(res, "Admin token required", 401);

        const decoded = jwtVerifyAdminToken(token);

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

        res.clearCookie('admin_token');
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
        const adminToken = extractToken(req, 'admin');
        const userToken = extractToken(req, 'user');
        
        if (!adminToken && !userToken) return sendError(res, "Authentication token required", 401);

        const fs = require('fs');
        fs.appendFileSync('debug.log', `--- Auth Debug ---\nAdmin Token present: ${!!adminToken}, User Token present: ${!!userToken}\n`);

        let authenticated = false;

        if (adminToken) {
            try {
                const decodedAdmin = jwtVerifyAdminToken(adminToken);
                fs.appendFileSync('debug.log', `Admin Token Decoded: ${JSON.stringify(decodedAdmin)}\n`);
                const admin = await findAdmin(decodedAdmin.id);
                if (admin && admin.status !== "banned") {
                    req.admin = admin;
                    authenticated = true;
                    fs.appendFileSync('debug.log', `Auth Success: Admin ${admin._id}\n`);
                } else {
                    fs.appendFileSync('debug.log', `Admin not found or banned: ${decodedAdmin.id}\n`);
                }
            } catch (adminErr) {
                fs.appendFileSync('debug.log', `Admin Verify Failed: ${adminErr.message}\n`);
            }
        }

        if (userToken) {
            try {
                const decodedUser = verifyUserToken(userToken);
                fs.appendFileSync('debug.log', `User Token Decoded: ${JSON.stringify(decodedUser)}\n`);
                const user = await findUser(decodedUser.id);
                if (user && user.status !== "banned") {
                    req.user = user;
                    authenticated = true;
                    fs.appendFileSync('debug.log', `Auth Success: User ${user._id}\n`);
                } else {
                    fs.appendFileSync('debug.log', `User not found or banned: ${decodedUser.id}\n`);
                }
            } catch (userErr) {
                fs.appendFileSync('debug.log', `User Verify Failed: ${userErr.message}\n`);
            }
        }

        if (authenticated) {
            return next();
        }

        if (adminToken) res.clearCookie('admin_token');
        if (userToken) res.clearCookie('user_token');
        res.clearCookie('token');
        return sendError(res, "Invalid or expired token", 401);
    } catch (error) {
        const fs = require('fs');
        fs.appendFileSync('debug.log', `Combined Auth Error: ${error.message}\n`);
        logger.error("Combined auth error", { error: error.message });
        return sendError(res, "Authentication failed", 401);
    }
};

const verifyAdminToken = authenticateAdmin;

// Optional: attaches req.admin or req.user if token present, never blocks the request
const optionalAuth = async (req, res, next) => {
    try {
        const adminToken = extractToken(req, 'admin');
        const userToken = extractToken(req, 'user');

        if (adminToken) {
            try {
                const decodedAdmin = jwtVerifyAdminToken(adminToken);
                const admin = await findAdmin(decodedAdmin.id);
                if (admin && admin.status !== 'banned') {
                    req.admin = admin;
                }
            } catch (_) { /* invalid admin token – ignore */ }
        }

        if (!req.admin && userToken) {
            try {
                const decodedUser = verifyUserToken(userToken);
                const user = await findUser(decodedUser.id);
                if (user && user.status !== 'banned') {
                    req.user = user;
                }
            } catch (_) { /* invalid user token – ignore */ }
        }
    } catch (_) { /* silently fail */ }
    return next();
};

module.exports = {
    authenticateUser,
    authenticateAdmin,
    verifyAdminToken,
    requireAdmin,
    authenticateUserOrAdmin,
    optionalAuth
};