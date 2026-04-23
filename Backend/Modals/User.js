const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
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
    phone: {
        type: String,
        trim: true
    },
    isVerifiedBadge: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: [true, 'Password is required.'],
        minLength: [8, 'Minimum 8 letters required.'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    },
    age: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    dob: {
        type: String,
        trim: true
    },
    bio: {
        type: String
    },
    addresses: [
        {
            street: { type: String, trim: true },
            apartment: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pinCode: { type: String, trim: true },
            country: { type: String, trim: true },
            isDefault: { type: Boolean, default: false }
        }
    ],
    isVerified: {
        type: Boolean,
        default: false
    },
    //doubt for storing in db
    verificationOTP: String,
    otpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
        throw error;
    }
});

UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getPublicProfile = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

UserSchema.statics.findActiveUsers = function () {
    return this.find({ status: 'active' });
};

UserSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', UserSchema);