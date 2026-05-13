const User = require('../Modals/User');
const { sendSuccess, sendError } = require('../utils/response');

const getWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return sendError(res, 'User not found', 404);
        }
        
        return sendSuccess(res, 'Wallet fetched successfully', user.wallet || { balance: 0, transactions: [] });
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

module.exports = {
    getWallet
};
