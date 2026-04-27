const User = require('../Modals/User');
const Admin = require('../Modals/Admin');
const { verifyUserToken , verifyAdminToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

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

        const token = extractToken(req);

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