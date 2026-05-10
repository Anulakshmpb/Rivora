const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, placeCODOrder, cancelOrder, returnOrder, getUserOrders } = require('../Controllers/orderController');
const { authenticateUser } = require('../Middlewares/auth');

router.get('/', authenticateUser, getUserOrders);
router.post('/create-razorpay-order', authenticateUser, createRazorpayOrder);
router.post('/verify-payment', authenticateUser, verifyPayment);
router.post('/place-cod-order', authenticateUser, placeCODOrder);
router.post('/:orderId/cancel', authenticateUser, cancelOrder);
router.post('/:orderId/return', authenticateUser, returnOrder);

module.exports = router;
