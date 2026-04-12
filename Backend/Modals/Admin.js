const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minLength: [2, 'Enter minimum 2 characters'],
        maxLength: [30, 'Cannot exceed maximum 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        minLength: [8, 'Minimum 8 letters required.'],
        select: false
    },
    role: {
        type: String,
        default: 'admin'
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active'
    },
    lastLogin: Date
}, {
    timestamps: true
});

AdminSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
        throw error;
    }
});

AdminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

AdminSchema.methods.getPublicProfile = function () {
    const adminObject = this.toObject();
    delete adminObject.password;
    return adminObject;
};

AdminSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('Admin', AdminSchema);
