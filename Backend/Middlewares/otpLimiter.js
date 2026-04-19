const rateLimit = require('express-rate-limit');

exports.otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 10, 
  message: {
    status: 'fail',
    message: "Too many OTP requests from this IP, please try again after 5 minutes"
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});
