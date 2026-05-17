const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    googleMapsUrl: {
        type: String,
        trim: true
    },
    socialLinks: [
        {
            platform: { type: String, required: true },
            url: { type: String, required: true }
        }
    ],
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
