const BaseController = require('./BaseController');
const { AuthService, AdminService } = require('../Services');
const OTPService = require('../Services/OtpService');

const {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  passwordChangeValidation
} = require('../utils/validation');

class AuthController extends BaseController {

  // REGISTER + SEND OTP
  static register = BaseController.asyncHandler(async (req, res) => {

    const validatedData =
    BaseController.validateRequest(
      registerValidation,
      req.body
    );

    const result =
    await AuthService.register(
      validatedData
    );

    // Send OTP after registration
    await OTPService.createOTP(
      result.user
    );

    BaseController.logAction(
      'USER_REGISTER',
      req,
      { userId: result.user._id }
    );

    BaseController.sendSuccess(

      res,

      'User registered. OTP sent to email',

      {
        userId: result.user._id,
        email: result.user.email
      },

      201

    );

  });


  // VERIFY EMAIL OTP
  static verifyEmail = BaseController.asyncHandler(async (req,res)=>{

    const {userId, otp} =
    req.body;

    if(!userId || !otp){

      return BaseController.sendError(

        res,

        "UserId and OTP required",

        400

      );

    }

    await OTPService.verifyOTP(

      userId,

      otp

    );

    const result =
    await AuthService.markUserVerified(
      userId
    );

    BaseController.logAction(
      'EMAIL_VERIFIED',
      req,
      {userId}
    );

    BaseController.sendSuccess(
      res,
      "Email verified successfully",
      result
    );

  });


  // RESEND OTP
  static resendOTP = BaseController.asyncHandler(async(req,res)=>{

    const {userId} =
    req.body;

    const user =
    await AuthService.getUserById(
      userId
    );

    if(!user){

      return BaseController.sendError(

        res,

        "User not found",

        404

      );

    }

    await OTPService.resendOTP(
      user
    );

    BaseController.logAction(

      'OTP_RESENT',

      req,

      {userId}

    );

    BaseController.sendSuccess(

      res,

      "OTP resent successfully"

    );

  });

  // FORGOT PASSWORD
  static forgotPassword = BaseController.asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return BaseController.sendError(res, "Email is required", 400);
    }

    const User = require('../Modals/User');
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return BaseController.sendError(res, "User not found with that email", 404);
    }

    await OTPService.createOTP(user, "passwordReset");

    BaseController.logAction('FORGOT_PASSWORD_OTP_SENT', req, { userId: user._id });

    BaseController.sendSuccess(
      res,
      'OTP sent to email',
      {
        userId: user._id,
        email: user.email
      }
    );
  });

  // VERIFY FORGOT PASSWORD OTP
  static verifyResetOTP = BaseController.asyncHandler(async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return BaseController.sendError(res, "UserId and OTP required", 400);
    }
    
    await OTPService.verifyOTP(userId, otp, "passwordReset");

    const User = require('../Modals/User');
    const user = await User.findById(userId);
    if (!user) return BaseController.sendError(res, "User not found", 404);

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    BaseController.logAction('FORGOT_PASSWORD_OTP_VERIFIED', req, { userId });

    BaseController.sendSuccess(res, "OTP verified successfully. Proceed to reset password.", { resetToken });
  });

  // RESET PASSWORD
  static resetPassword = BaseController.asyncHandler(async (req, res) => {
    const { userId, resetToken, newPassword } = req.body;
    if (!userId || !resetToken || !newPassword) {
      return BaseController.sendError(res, "User ID, Reset Token, and New Password are required", 400);
    }

    const User = require('../Modals/User');
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        _id: userId,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
        return BaseController.sendError(res, "Token is invalid or has expired", 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    BaseController.logAction('PASSWORD_RESET_SUCCESS', req, { userId: user._id });

    BaseController.sendSuccess(res, "Password has been successfully reset");
  });



  static login = BaseController.asyncHandler(async (req, res) => {

    const validatedData =
    BaseController.validateRequest(
      loginValidation,
      req.body
    );

    const result =
    await AuthService.login(
      validatedData
    );

    BaseController.logAction(

      'USER_LOGIN',

      req,

      { userId: result.user._id }

    );

    BaseController.sendSuccess(

      res,

      'Login successful',

      result

    );

  });


  static getProfile = BaseController.asyncHandler(async (req, res) => {

    const user =
    BaseController.sanitizeUser(
      req.user
    );

    BaseController.sendSuccess(

      res,

      'Profile retrieved successfully',

      { user }

    );

  });


  static updateProfile = BaseController.asyncHandler(async (req, res) => {

    const validatedData =
    BaseController.validateRequest(

      profileUpdateValidation,

      req.body

    );

    const user =
    await AuthService.updateProfile(

      req.user._id,

      validatedData

    );

    BaseController.logAction(

      'PROFILE_UPDATE',

      req

    );

    BaseController.sendSuccess(

      res,

      'Profile updated successfully',

      { user }

    );

  });


  static changePassword = BaseController.asyncHandler(async (req, res) => {

    const validatedData =
    BaseController.validateRequest(

      passwordChangeValidation,

      req.body

    );

    await AuthService.changePassword(

      req.user._id,

      validatedData

    );

    BaseController.logAction(

      'PASSWORD_CHANGE',

      req

    );

    BaseController.sendSuccess(

      res,

      'Password changed successfully'

    );

  });


  static logout = BaseController.asyncHandler(async (req, res) => {

    BaseController.logAction(

      'USER_LOGOUT',

      req

    );

    BaseController.sendSuccess(

      res,

      'Logged out successfully'

    );

  });

  static adminLogin = BaseController.asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await AdminService.login({ email, password });

    BaseController.logAction('ADMIN_LOGIN', req, { adminId: result.admin._id });

    BaseController.sendSuccess(res, 'Admin login successful', result);
  });

  // ADMIN: Get all users
  static getAllUsers = BaseController.asyncHandler(async (req, res) => {
    // This is a placeholder; usually you'd have an AdminService method for this
    const User = require('../Modals/User');
    const users = await User.find({});
    BaseController.sendSuccess(res, 'Users retrieved successfully', { users });
  });

  // Placeholder methods for other admin routes to prevent crashes
  static getUserById = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static updateUserStatus = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static banUser = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static unbanUser = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static forceLogoutUser = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static updateUser = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static deleteUser = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static getDashboardStats = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
}

module.exports = AuthController;