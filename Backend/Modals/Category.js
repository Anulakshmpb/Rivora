const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true,
        maxLength: [50, "Category name cannot exceed 50 characters"]
    },
    main: {
        type: Boolean,
        default: false
    },
    images: {
        type: [String],
        default: []
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
