const express = require('express');
const AuthController = require('../Controllers/AuthController');
const { authenticateUser } = require('../Middlewares/auth');
const checkUserStatus = require('../Middlewares/checkUserStatus');
const { otpLimiter } = require('../Middlewares/otpLimiter');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', checkUserStatus, AuthController.login);
router.post('/verify', AuthController.verifyEmail);
router.post('/resend', otpLimiter, AuthController.resendOTP);
router.post('/forgot-password', otpLimiter, AuthController.forgotPassword);
router.post('/verify-reset-otp', otpLimiter, AuthController.verifyResetOTP);
router.post('/reset-password', AuthController.resetPassword);

router.get('/get-profile', checkUserStatus, authenticateUser, AuthController.getProfile);
router.put('/profile', checkUserStatus, authenticateUser, AuthController.updateProfile);
router.put('/change-password', checkUserStatus, authenticateUser, AuthController.changePassword);
router.post('/logout', checkUserStatus, authenticateUser, AuthController.logout);

module.exports = router;