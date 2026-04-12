const User = require('../Modals/User');
const { generateUserToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { AuthenticationError, ConflictError, NotFoundError } = require('../utils/errors');

class AuthService {

	/* ================= REGISTER ================= */

	static async register(userData) {

		try {

			// Normalize email
			userData.email = userData.email.toLowerCase().trim();

			// Check existing user
			const existingUser = await User.findOne({ email: userData.email });

			if (existingUser) {
				throw new ConflictError("User already exists", { 
					userId: existingUser._id, 
					isVerified: existingUser.isVerified 
				});
			}

			// Create user
			const user = await User.create(userData);

			// Generate token
			const token = generateUserToken({
				id: user._id,
				email: user.email,
				role: user.role
			});

			logger.info(`User registered: ${user.email}`);

			return {

				user: user.getPublicProfile(),
				token

			};

		}
		catch (error) {

			// Mongo duplicate key protection
			if (error.code === 11000) {
				throw new ConflictError("Email already exists");
			}

			logger.error("Register error", error);

			throw error;

		}

	}

	/* ================= LOGIN ================= */

	static async login(credentials) {

		try {

			const { email, password } = credentials;

			// Normalize email
			const normalizedEmail = email.toLowerCase().trim();

			// Get user with password
			const user = await User
				.findOne({ email: normalizedEmail })
				.select("+password");

			if (!user) {
				throw new AuthenticationError("Invalid credentials");
			}

			// Enforce OTP Registration Check
			if (!user.isVerified) {
			    throw new AuthenticationError("Account not verified. Please verify your OTP to login.");
			}

			// Check account lock
			if (user.lockUntil && user.lockUntil > Date.now()) {

				throw new AuthenticationError(
					"Account locked. Try again later"
				);

			}

			// Compare password
			const isValid = await user.comparePassword(password);

			if (!isValid) {

				// Increase failed attempts
				user.failedLoginAttempts += 1;

				// Lock account after 5 attempts
				if (user.failedLoginAttempts >= 5) {

					user.lockUntil =
						Date.now() + 15 * 60 * 1000;

				}

				await user.save();

				throw new AuthenticationError(
					"Invalid credentials"
				);

			}

			// Reset attempts on success
			user.failedLoginAttempts = 0;
			user.lockUntil = undefined;

			// Update last login
			user.lastLogin = new Date();

			await user.save();

			// Generate token
			const token = generateUserToken({

				id: user._id,
				role: user.role

			});

			logger.info(`User login: ${user.email}`);

			return {

				user: user.getPublicProfile(),
				token

			};

		}
		catch (error) {

			logger.error("Login error", error);

			throw error;

		}

	}

	/* ================= VERIFY EMAIL ================= */
	static async markUserVerified(userId) {
		try {
			const user = await User.findByIdAndUpdate(
				userId,
				{ isVerified: true },
				{ new: true }
			);

			if (!user) {
				throw new NotFoundError("User not found");
			}

			// Generate token for auto-login
			const token = generateUserToken({
				id: user._id,
				email: user.email,
				role: user.role
			});

			logger.info(`Email verified for user: ${user.email}`);

			return {
				user: user.getPublicProfile(),
				token
			};
		} catch (error) {
			logger.error("Mark user verified error", error);
			throw error;
		}
	}

	/* ================= UPDATE PROFILE ================= */

	static async updateProfile(userId, updateData) {

		try {

			const user = await User.findByIdAndUpdate(
				userId,
				{ $set: updateData },
				{ new: true, runValidators: true }
			);

			if (!user) {
				throw new NotFoundError("User not found");
			}

			logger.info(`Profile updated for user: ${user.email}`);

			return user.getPublicProfile();

		} catch (error) {

			logger.error("Update profile error", error);

			throw error;

		}

	}

	/* ================= CHANGE PASSWORD ================= */

	static async changePassword(userId, data) {

		try {

			const { currentPassword, newPassword } = data;

			const user = await User.findById(userId).select("+password");

			if (!user) {
				throw new NotFoundError("User not found");
			}

			// Verify current password
			const isMatch = await user.comparePassword(currentPassword);

			if (!isMatch) {
				throw new AuthenticationError("Invalid current password");
			}

			// Update and save (this will trigger the pre-save hook for hashing)
			user.password = newPassword;

			await user.save();

			logger.info(`Password changed for user: ${user.email}`);

			return true;

		} catch (error) {

			logger.error("Change password error", error);

			throw error;

		}

	}

}

module.exports = AuthService;