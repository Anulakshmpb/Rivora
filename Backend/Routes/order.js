const express = require('express');
const router = express.Router();
const { 
    createRazorpayOrder, 
    verifyPayment, 
    placeCODOrder, 
    cancelOrder, 
    returnOrder, 
    getUserOrders,
    sendWalletOTP,
    verifyWalletOTP,
    placeWalletOrder
} = require('../Controllers/orderController');
const { authenticateUser } = require('../Middlewares/auth');

router.get('/', authenticateUser, getUserOrders);
router.post('/create-razorpay-order', authenticateUser, createRazorpayOrder);
router.post('/verify-payment', authenticateUser, verifyPayment);
router.post('/place-cod-order', authenticateUser, placeCODOrder);
router.post('/send-wallet-otp', authenticateUser, sendWalletOTP);
router.post('/verify-wallet-otp', authenticateUser, verifyWalletOTP);
router.post('/place-wallet-order', authenticateUser, placeWalletOrder);
router.post('/:orderId/cancel', authenticateUser, cancelOrder);
router.post('/:orderId/return', authenticateUser, returnOrder);

module.exports = router;
