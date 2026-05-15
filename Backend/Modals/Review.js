const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: [true, 'Review text is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['site', 'product', 'order'],
        required: [true, 'Review type is required']
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: function() {
            return this.type === 'product' || this.type === 'order';
        }
    },
    img: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
