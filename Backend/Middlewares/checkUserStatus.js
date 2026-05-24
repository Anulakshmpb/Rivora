const User = require('../Modals/User');
const Admin = require('../Modals/Admin');
const { verifyUserToken , verifyAdminToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const extractToken = (req, type) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    if (req.cookies) {
        if (type === 'admin' && req.cookies.admin_token) return req.cookies.admin_token;
        if (type === 'user' && req.cookies.user_token) return req.cookies.user_token;
        if (req.cookies.token) return req.cookies.token; // legacy
    }

    return null;
};

const decodeToken = (token)=>{

    try{
        return verifyUserToken(token);
    }
    catch{

        try{
            return verifyAdminToken(token);
        }
        catch{
            return null;
        }

    }

};

const checkUserStatus = async(req,res,next)=>{

    try{

        let token = extractToken(req, 'user');
        if (!token) {
            token = extractToken(req, 'admin');
        }

        if(!token)
            return next();

        const decoded = decodeToken(token);

        if(!decoded)
            return next();

        let account = await User.findById(decoded.id);

        if (!account) {
            account = await Admin.findById(decoded.id);
        }

        if (!account)
            return sendError(res, "Account not found", 404);

        if (account.status === "banned")
            return sendError(
                res,
                "Account banned contact support",
                403,
                { banned: true }
            );

        next();

    }
    catch(error){

        return sendError(res,"Status check failed",500);
    }
};

module.exports = checkUserStatus;