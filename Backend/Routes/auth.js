const express = require('express');
const AuthController = require('../Controllers/AuthController');
const { authenticateUser, authenticateUserOrAdmin } = require('../Middlewares/auth');
const checkUserStatus = require('../Middlewares/checkUserStatus');
const { otpLimiter } = require('../Middlewares/otpLimiter');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify', otpLimiter, AuthController.verifyEmail);
router.post('/resend', otpLimiter, AuthController.resendOTP);
router.post('/forgot-password', otpLimiter, AuthController.forgotPassword);
router.post('/verify-reset-otp', otpLimiter, AuthController.verifyResetOTP);
router.post('/reset-password', otpLimiter, AuthController.resetPassword);

router.get('/get-profile', checkUserStatus, authenticateUserOrAdmin, AuthController.getProfile);
router.put('/profile', checkUserStatus, authenticateUserOrAdmin, AuthController.updateProfile);
router.put('/change-password', checkUserStatus, authenticateUserOrAdmin, AuthController.changePassword);
router.post('/logout', checkUserStatus, authenticateUser, AuthController.logout);

module.exports = router;