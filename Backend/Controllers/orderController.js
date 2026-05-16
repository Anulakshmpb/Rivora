const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../Modals/Order');
const Product = require('../Modals/Product');
const User = require('../Modals/User');
const Return = require('../Modals/Return');
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
            amount: Math.round(amount * 100),
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
                appliedCoupon: orderDetails.appliedCouponId,
                shippingCost: orderDetails.shippingCost,
                taxAmount: orderDetails.taxAmount,
                paymentMethod: 'razorpay',
                paymentStatus: 'Paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });

            await newOrder.save();

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
            appliedCoupon: orderDetails.appliedCouponId,
            shippingCost: orderDetails.shippingCost,
            taxAmount: orderDetails.taxAmount,
            paymentMethod: 'cod',
            paymentStatus: 'Pending',
            orderStatus: 'Processing'
        });

        await newOrder.save();

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
        const { productId } = req.body;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) return sendError(res, 'Order not found', 404);

        if (order.orderStatus === 'Cancelled') {
            return sendError(res, 'Order is already cancelled', 400);
        }

        if ((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60) > 48) {
            return sendError(res, 'Cancellation window (2 days) has expired', 400);
        }

        if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
            return sendError(res, `Cannot cancel order that is already ${order.orderStatus}`, 400);
        }

        let refundAmount = 0;

        if (productId) {
            const itemIndex = order.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex === -1) return sendError(res, 'Product not found in this order', 404);

            const item = order.items[itemIndex];
            if (item.status === 'Cancelled') return sendError(res, 'Item already cancelled', 400);

            // Calculate item price for refund
            const itemTotal = item.price * item.quantity;
            item.status = 'Cancelled';

            // Refund this item to wallet for all payment methods
            refundAmount = itemTotal;
            await refundToWallet(
                userId, 
                refundAmount, 
                `Refund for cancelled item from order #${order._id}`,
                order._id
            );

            // Restore product stock
            await Product.findByIdAndUpdate(productId, {
                $inc: { quantity: item.quantity }
            });

            // Check if all items are now cancelled
            const allCancelled = order.items.every(i => i.status === 'Cancelled');
            if (allCancelled) {
                order.orderStatus = 'Cancelled';
                order.paymentStatus = 'Refunded';
            }

            await order.save();
            return sendSuccess(res, 'Item cancelled successfully and amount refunded to wallet', {
                order,
                refundAmount
            });
        } else {
            // Full Order Cancellation (legacy/fallback)
            order.orderStatus = 'Cancelled';

            // Refund total amount to wallet if payment status is 'Paid'
            // Refund total amount to wallet for all payment methods
            await refundToWallet(
                userId,
                order.totalAmount,
                `Refund for cancelled order #${order._id}`,
                order._id
            );
            order.paymentStatus = 'Refunded';

            // Update all items status
            order.items.forEach(item => {
                if (item.status !== 'Cancelled') {
                    item.status = 'Cancelled';
                }
            });

            await order.save();

            // Restore stock for all items
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { quantity: item.quantity }
                });
            }

            return sendSuccess(res, 'Order cancelled successfully', order);
        }
    } catch (err) {
        console.error('Cancel Order Error:', err);
        return sendError(res, err.message, 500);
    }
};

const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason, productId } = req.body;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) return sendError(res, 'Order not found', 404);

        if (order.orderStatus !== 'Delivered') {
            return sendError(res, 'Only delivered orders can be returned', 400);
        }

        if (productId) {
            const itemIndex = order.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex === -1) return sendError(res, 'Product not found in this order', 404);

            const item = order.items[itemIndex];
            if (item.status === 'Return Requested' || item.status === 'Returned') {
                return sendError(res, 'Return already requested or completed for this item', 400);
            }

            item.status = 'Return Requested';

            await Return.create({
                order: order._id,
                user: userId,
                product: item.product,
                reason: reason,
                status: 'Pending'
            });

            const allProcessed = order.items.every(i => ['Returned', 'Cancelled', 'Return Requested'].includes(i.status));
            if (allProcessed) {
                order.orderStatus = 'Return Requested';
            }

            await order.save();
            return sendSuccess(res, 'Return requested successfully. Awaiting admin approval.', {
                order
            });
        } else {
            order.orderStatus = 'Return Requested';
            order.returnReason = reason;

            const returnPromises = order.items.map(item => {
                if (!['Return Requested', 'Returned', 'Cancelled'].includes(item.status)) {
                    item.status = 'Return Requested';
                    return Return.create({
                        order: order._id,
                        user: userId,
                        product: item.product,
                        reason: reason
                    });
                }
                return null;
            }).filter(p => p !== null);

            await Promise.all(returnPromises);
            await order.save();

            return sendSuccess(res, 'Order return requested successfully', order);
        }
    } catch (err) {
        console.error('Return Order Error:', err);
        return sendError(res, err.message, 500);
    }
};

const approveReturn = async (req, res) => {
    try {
        const { returnId } = req.params;
        const returnRecord = await Return.findById(returnId).populate('order').populate('user');

        if (!returnRecord) return sendError(res, 'Return request not found', 404);
        if (returnRecord.status !== 'Pending') {
            return sendError(res, 'Return request already processed', 400);
        }

        const order = returnRecord.order;
        if (!order) return sendError(res, 'Associated order not found', 404);

        returnRecord.status = 'Approved';
        await returnRecord.save();

        const itemIndex = order.items.findIndex(item => item.product.toString() === returnRecord.product.toString());
        if (itemIndex !== -1) {
            order.items[itemIndex].status = 'Returned';
        }

        const allProcessed = order.items.every(i => ['Returned', 'Cancelled'].includes(i.status));
        if (allProcessed) {
            order.orderStatus = 'Returned';
            order.paymentStatus = 'Refunded';
        }

        await order.save();

        const item = order.items[itemIndex];
        const refundAmount = item ? (item.price * item.quantity) : 0;

        if (item) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: item.quantity }
            });
        }

        await refundToWallet(
            returnRecord.user._id,
            refundAmount,
            `Refund for returned item in order #${order._id}`,
            order._id
        );

        return sendSuccess(res, 'Return approved and refund processed for the item', order);
    } catch (err) {
        console.error('Approve Return Error:', err);
        return sendError(res, err.message, 500);
    }
};

const rejectReturn = async (req, res) => {
    try {
        const { returnId } = req.params;
        const { reason } = req.body;

        const returnRecord = await Return.findById(returnId).populate('order');
        if (!returnRecord) return sendError(res, 'Return request not found', 404);

        if (returnRecord.status !== 'Pending') {
            return sendError(res, 'Return request already processed', 400);
        }

        const order = returnRecord.order;
        if (!order) return sendError(res, 'Associated order not found', 404);

        returnRecord.status = 'Rejected';
        returnRecord.adminComment = reason || 'No reason provided';
        await returnRecord.save();

        if (order.items && order.items.length > 0) {
            const itemIndex = order.items.findIndex(item =>
                item.product && item.product.toString() === returnRecord.product.toString()
            );

            if (itemIndex !== -1) {
                order.items[itemIndex].status = 'Delivered';

                const anyPendingReturn = order.items.some(i => i.status === 'Return Requested');
                if (!anyPendingReturn && order.orderStatus === 'Return Requested') {
                    order.orderStatus = 'Delivered';
                }

                await order.save();
            }
        }

        return sendSuccess(res, 'Return request rejected successfully', {
            orderId: order._id,
            status: 'Rejected'
        });
    } catch (err) {
        console.error('Reject Return Error:', err);
        return sendError(res, err.message, 500);
    }
};

const getReturnRequests = async (req, res) => {
    try {
        const returns = await Return.find()
            .populate('user', 'name email mobile')
            .populate('product', 'name image price')
            .populate('order', 'totalAmount createdAt')
            .sort({ createdAt: -1 });

        return sendSuccess(res, 'Return requests fetched successfully', returns);
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

        const newOrder = new Order({
            user: userId,
            items: orderDetails.items,
            shippingAddress: orderDetails.shippingAddress,
            totalAmount: orderDetails.totalAmount,
            discountAmount: orderDetails.discountAmount,
            appliedCoupon: orderDetails.appliedCouponId,
            shippingCost: orderDetails.shippingCost,
            taxAmount: orderDetails.taxAmount,
            paymentMethod: 'wallet',
            paymentStatus: 'Paid',
            orderStatus: 'Processing'
        });

        await newOrder.save();

        // Atomic deduction to avoid race conditions
        await User.findByIdAndUpdate(userId, {
            $inc: { 'wallet.balance': -orderDetails.totalAmount },
            $push: {
                'wallet.transactions': {
                    type: 'Debit',
                    amount: orderDetails.totalAmount,
                    description: `Payment for order #${newOrder._id}`,
                    orderId: newOrder._id,
                    date: new Date()
                }
            }
        });
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

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Return Requested'];
        if (!validStatuses.includes(status)) {
            return sendError(res, 'Invalid status', 400);
        }

        const order = await Order.findById(orderId);
        if (!order) return sendError(res, 'Order not found', 404);

        const oldStatus = order.orderStatus;
        order.orderStatus = status;

        // Sync item statuses if overall order status is updated
        if (['Cancelled', 'Delivered', 'Shipped', 'Processing'].includes(status)) {
            for (const item of order.items) {
                // Only sync if item doesn't have a terminal status already
                if (!['Cancelled', 'Returned', 'Return Requested'].includes(item.status)) {

                    // If cancelling the whole order, restore stock for items
                    if (status === 'Cancelled' && item.status !== 'Cancelled') {
                        await Product.findByIdAndUpdate(item.product, {
                            $inc: { quantity: item.quantity }
                        });
                    }

                    item.status = status;
                }
            }
        }

        if (status === 'Cancelled') {
            order.paymentStatus = 'Refunded';
            
            // Refund total amount to wallet for all payment methods
            await refundToWallet(
                order.user,
                order.totalAmount,
                `Refund for order #${order._id} (Cancelled by Admin)`,
                order._id
            );
        }

        await order.save();
        const populatedOrder = await Order.findById(orderId).populate('user', 'name email');

        return sendSuccess(res, `Order status updated to ${status}`, populatedOrder);
    } catch (err) {
        console.error('Update Order Status Error:', err);
        return sendError(res, err.message, 500);
    }
};

const refundToWallet = async (userId, amount, description, orderId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`Refund failed: User ${userId} not found`);
            return false;
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { 'wallet.balance': Number(amount) },
                $push: {
                    'wallet.transactions': {
                        type: 'Credit',
                        amount: Number(amount),
                        description: description,
                        orderId: orderId,
                        date: new Date()
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (updatedUser) {
            console.log(`Wallet refund successful. New balance: ${updatedUser.wallet.balance}`);
            return true;
        } else {
            console.error('Wallet refund failed: findByIdAndUpdate returned null');
            return false;
        }
    } catch (err) {
        console.error('Wallet Refund Error:', err);
        return false;
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
    updateOrderStatus,
    approveReturn,
    rejectReturn,
    getReturnRequests
};
