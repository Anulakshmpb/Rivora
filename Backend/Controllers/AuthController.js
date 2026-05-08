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

    // Set HTTP-only cookie
    this.setAuthCookie(res, result.token);

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



  static setAuthCookie = (res, token) => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    res.cookie('token', token, cookieOptions);
  };

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

    // Set HTTP-only cookie
    this.setAuthCookie(res, result.token);

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
    const profile = req.user || req.admin;
    const user = BaseController.sanitizeUser(profile);

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

    res.clearCookie('token');

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

    // Set HTTP-only cookie
    this.setAuthCookie(res, result.token);

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

  // ADMIN: Get user by ID
  static getUserById = BaseController.asyncHandler(async (req, res) => {
    const User = require('../Modals/User');
    const user = await User.findById(req.params.id).select('-password -verificationOTP -otpExpires -resetPasswordToken -resetPasswordExpires -__v');
    if (!user) return BaseController.sendNotFound(res, 'User');
    BaseController.sendSuccess(res, 'User retrieved successfully', { user });
  });

  // ADMIN: Update user
  static updateUser = BaseController.asyncHandler(async (req, res) => {
    const User = require('../Modals/User');
    const { name, email, phone, role, isVerified, isBanned } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return BaseController.sendNotFound(res, 'User');

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isBanned !== undefined) user.isBanned = isBanned;

    await user.save();
    BaseController.logAction('USER_UPDATED', req, { userId: user._id });
    BaseController.sendSuccess(res, 'User updated successfully', { user: BaseController.sanitizeUser(user) });
  });

  // ADMIN: Delete user
  static deleteUser = BaseController.asyncHandler(async (req, res) => {
    const User = require('../Modals/User');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return BaseController.sendNotFound(res, 'User');
    BaseController.logAction('USER_DELETED', req, { userId: req.params.id });
    BaseController.sendSuccess(res, 'User deleted successfully');
  });

  // ADMIN: Ban user
  static banUser = BaseController.asyncHandler(async (req, res) => {
    const User = require('../Modals/User');
    const user = await User.findById(req.params.id);
    if (!user) return BaseController.sendNotFound(res, 'User');
    user.isBanned = true;
    await user.save();
    BaseController.logAction('USER_BANNED', req, { userId: user._id });
    BaseController.sendSuccess(res, 'User banned successfully', { user: BaseController.sanitizeUser(user) });
  });

  // ADMIN: Unban user
  static unbanUser = BaseController.asyncHandler(async (req, res) => {
    const User = require('../Modals/User');
    const user = await User.findById(req.params.id);
    if (!user) return BaseController.sendNotFound(res, 'User');
    user.isBanned = false;
    await user.save();
    BaseController.logAction('USER_UNBANNED', req, { userId: user._id });
    BaseController.sendSuccess(res, 'User unbanned successfully', { user: BaseController.sanitizeUser(user) });
  });

  // Placeholder methods for other admin routes
  static updateUserStatus = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static forceLogoutUser = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
  static getDashboardStats = BaseController.asyncHandler(async (req, res) => { /* Placeholder */ });
}

module.exports = AuthController;