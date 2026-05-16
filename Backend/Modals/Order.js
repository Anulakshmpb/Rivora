const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        size: String,
        color: String,
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['Ordered', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
            default: 'Ordered'
        }
    }],
    shippingAddress: {
        street: String,
        apartment: String,
        city: String,
        state: String,
        pinCode: String,
        country: String
    },
    mobile: String,
    totalAmount: {
        type: Number,
        required: true
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    appliedCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cod', 'wallet', 'others'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Return Requested'],
        default: 'Processing'
    },
    returnReason: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
