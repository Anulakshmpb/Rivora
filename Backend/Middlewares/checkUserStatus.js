const User = require('../Modals/User');
const { verifyUserToken , verifyAdminToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const extractToken = (req)=>{

    const authHeader = req.headers.authorization;

    if(!authHeader)
        return null;

    if(!authHeader.startsWith("Bearer "))
        return null;

    return authHeader.split(" ")[1];
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

        const user = await User.findById(decoded.id);

        if(!user)
            return sendError(res,"User not found",404);

        if(user.status === "banned")
            return sendError(
                res,
                "Account banned contact support",
                403,
                {banned:true}
            );

        next();

    }
    catch(error){

        return sendError(res,"Status check failed",500);
    }
};

module.exports = checkUserStatus;