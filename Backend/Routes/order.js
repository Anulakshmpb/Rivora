const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../Controllers/orderController');
const { authenticateUser } = require('../Middlewares/auth');

router.post('/create-razorpay-order', authenticateUser, createRazorpayOrder);
router.post('/verify-payment', authenticateUser, verifyPayment);

module.exports = router;
