const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../Modals/Order');
const Product = require('../Modals/Product');
const User = require('../Modals/User');
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

            // Update product stock
            for (const item of orderDetails.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: -item.quantity }
                });
            }

            const populatedOrder = await Order.findById(newOrder._id).populate('user', 'name email');

            return sendSuccess(res, 'Payment verified and order placed successfully', populatedOrder);
        } else {
            return sendError(res, 'Invalid payment signature', 400);
        }
    } catch (err) {
        console.error('Error verifying payment:', err);
        return sendError(res, err.message || 'Internal server error', 500);
    }
};

const placeCODOrder = async (req, res) => {
    try {
        const { orderDetails } = req.body;
        const userId = req.user?._id || req.admin?._id;

        if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
            return sendError(res, 'Order details are missing', 400);
        }

        const newOrder = new Order({
            user: userId,
            items: orderDetails.items,
            shippingAddress: orderDetails.shippingAddress,
            totalAmount: orderDetails.totalAmount,
            discountAmount: orderDetails.discountAmount,
            shippingCost: orderDetails.shippingCost,
            taxAmount: orderDetails.taxAmount,
            paymentMethod: 'cod',
            paymentStatus: 'Pending',
            orderStatus: 'Processing'
        });

        await newOrder.save();

        // Update product stock
        for (const item of orderDetails.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            });
        }

        const populatedOrder = await Order.findById(newOrder._id).populate('user', 'name email');

        return sendSuccess(res, 'COD order placed successfully', populatedOrder);
    } catch (err) {
        console.error('Error placing COD order:', err);
        return sendError(res, err.message || 'Internal server error', 500);
    }
};



const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) return sendError(res, 'Order not found', 404);

        if (order.orderStatus === 'Cancelled') {
            return sendError(res, 'Order is already cancelled', 400);
        }

        if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
            return sendError(res, `Cannot cancel order that is already ${order.orderStatus}`, 400);
        }

        order.orderStatus = 'Cancelled';
        
        // Refund to wallet if payment status is 'Paid'
        if (order.paymentStatus === 'Paid') {
            const user = await User.findById(userId);
            if (!user) return sendError(res, 'User not found', 404);

            if (!user.wallet) user.wallet = { balance: 0, transactions: [] };

            user.wallet.balance += order.totalAmount;
            user.wallet.transactions.push({
                type: 'Credit',
                amount: order.totalAmount,
                description: `Refund for cancelled order #${order._id}`,
                orderId: order._id
            });
            await user.save();
            order.paymentStatus = 'Refunded';
        }

        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: item.quantity }
            });
        }

        return sendSuccess(res, 'Order cancelled successfully', order);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) return sendError(res, 'Order not found', 404);

        if (order.orderStatus !== 'Delivered') {
            return sendError(res, 'Only delivered orders can be returned', 400);
        }

        // Return logic: For demo, we just set status to 'Returned' and refund to wallet
        order.orderStatus = 'Returned';
        
        const user = await User.findById(userId);
        if (!user) return sendError(res, 'User not found', 404);

        if (!user.wallet) user.wallet = { balance: 0, transactions: [] };

        user.wallet.balance += order.totalAmount;
        user.wallet.transactions.push({
            type: 'Credit',
            amount: order.totalAmount,
            description: `Refund for returned order #${order._id}`,
            orderId: order._id
        });
        await user.save();
        order.paymentStatus = 'Refunded';

        await order.save();

        return sendSuccess(res, 'Order return requested and processed', order);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const OTPService = require('../Services/OtpService');

const sendWalletOTP = async (req, res) => {
    try {
        const user = req.user;
        await OTPService.createOTP(user, 'walletPayment');
        return sendSuccess(res, 'OTP sent to your email for wallet payment confirmation');
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const verifyWalletOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user._id;
        await OTPService.verifyOTP(userId, otp, 'walletPayment');
        return sendSuccess(res, 'OTP verified successfully');
    } catch (err) {
        return sendError(res, err.message, 400);
    }
};

const placeWalletOrder = async (req, res) => {
    try {
        const { orderDetails } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user || !user.wallet || user.wallet.balance < orderDetails.totalAmount) {
            return sendError(res, 'Insufficient wallet balance', 400);
        }

        // Deduct balance
        user.wallet.balance -= orderDetails.totalAmount;
        
        const newOrder = new Order({
            user: userId,
            items: orderDetails.items,
            shippingAddress: orderDetails.shippingAddress,
            totalAmount: orderDetails.totalAmount,
            discountAmount: orderDetails.discountAmount,
            shippingCost: orderDetails.shippingCost,
            taxAmount: orderDetails.taxAmount,
            paymentMethod: 'wallet',
            paymentStatus: 'Paid',
            orderStatus: 'Processing'
        });

        await newOrder.save();

        user.wallet.transactions.push({
            type: 'Debit',
            amount: orderDetails.totalAmount,
            description: `Payment for order #${newOrder._id}`,
            orderId: newOrder._id
        });
        await user.save();

        // Update product stock
        for (const item of orderDetails.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            });
        }

        const populatedOrder = await Order.findById(newOrder._id).populate('user', 'name email');
        return sendSuccess(res, 'Order placed successfully using wallet balance', populatedOrder);
    } catch (err) {
        console.error('Error placing wallet order:', err);
        return sendError(res, err.message || 'Internal server error', 500);
    }
};

const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 });
            
        return sendSuccess(res, 'User orders fetched successfully', orders);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email mobile')
            .populate('items.product')
            .sort({ createdAt: -1 });
            
        return sendSuccess(res, 'All orders fetched successfully', orders);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
        if (!validStatuses.includes(status)) {
            return sendError(res, 'Invalid status', 400);
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: status },
            { new: true }
        ).populate('user', 'name email');

        if (!order) return sendError(res, 'Order not found', 404);

        return sendSuccess(res, `Order status updated to ${status}`, order);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment,
    placeCODOrder,
    cancelOrder,
    returnOrder,
    getUserOrders,
    sendWalletOTP,
    verifyWalletOTP,
    placeWalletOrder,
    getAllOrders,
    updateOrderStatus
};
