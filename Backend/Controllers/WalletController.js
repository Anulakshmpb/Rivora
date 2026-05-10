const Wallet = require('../Modals/Wallet');
const { sendSuccess, sendError } = require('../utils/response');

const getWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        let wallet = await Wallet.findOne({ user: userId });
        
        if (!wallet) {
            wallet = await Wallet.create({ user: userId, balance: 0, transactions: [] });
        }
        
        return sendSuccess(res, 'Wallet fetched successfully', wallet);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

module.exports = {
    getWallet
};
