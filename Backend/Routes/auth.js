const express = require('express');
const AuthController = require('../Controllers/AuthController');
const { authenticateUser, authenticateUserOrAdmin } = require('../Middlewares/auth');
const checkUserStatus = require('../Middlewares/checkUserStatus');
const { otpLimiter } = require('../Middlewares/otpLimiter');
const { loginLimiter } = require('../Middlewares/setup');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} = require('../Middlewares/validation');

const router = express.Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login', loginLimiter, validateLogin, AuthController.login);
router.post('/verify', otpLimiter, AuthController.verifyEmail);
router.post('/resend', otpLimiter, AuthController.resendOTP);
router.post('/forgot-password', otpLimiter, AuthController.forgotPassword);
router.post('/verify-reset-otp', otpLimiter, AuthController.verifyResetOTP);
router.post('/reset-password', otpLimiter, AuthController.resetPassword);

router.get('/get-profile', checkUserStatus, authenticateUserOrAdmin, AuthController.getProfile);
router.put('/profile', checkUserStatus, authenticateUserOrAdmin, validateProfileUpdate, AuthController.updateProfile);
router.put('/change-password', checkUserStatus, authenticateUserOrAdmin, validatePasswordChange, AuthController.changePassword);
router.post('/logout', checkUserStatus, authenticateUser, AuthController.logout);

module.exports = router;