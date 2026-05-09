const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../Modals/Order');
const { sendSuccess, sendError } = require('../utils/response');

const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return sendError(res, 'Razorpay keys are missing', 500);
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            return sendError(res, 'Failed to create Razorpay order', 500);
        }

        return sendSuccess(res, 'Razorpay order created successfully', order);
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        return sendError(res, err.message || 'Internal server error', 500);
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderDetails
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified, save order to DB
            const userId = req.user?._id || req.admin?._id;
            
            const newOrder = new Order({
                user: userId,
                items: orderDetails.items,
                shippingAddress: orderDetails.shippingAddress,
                totalAmount: orderDetails.totalAmount,
                discountAmount: orderDetails.discountAmount,
                shippingCost: orderDetails.shippingCost,
                taxAmount: orderDetails.taxAmount,
                paymentMethod: 'razorpay',
                paymentStatus: 'Paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });

            await newOrder.save();

            return sendSuccess(res, 'Payment verified and order placed successfully', newOrder);
        } else {
            return sendError(res, 'Invalid payment signature', 400);
        }
    } catch (err) {
        console.error('Error verifying payment:', err);
        return sendError(res, err.message || 'Internal server error', 500);
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment
};
