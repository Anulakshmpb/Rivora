const User = require('../Modals/User');
const { generateUserToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { AuthenticationError, ConflictError, NotFoundError } = require('../utils/errors');

class AuthService {

	/* ================= REGISTER ================= */

	static async register(userData) {

		try {
			userData.email = userData.email.toLowerCase().trim();
			const existingUser = await User.findOne({ email: userData.email });
			if (existingUser) {
				throw new ConflictError("User already exists", {
					userId: existingUser._id,
					isVerified: existingUser.isVerified
				});
			}
			const user = await User.create(userData);
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
			const normalizedEmail = email.toLowerCase().trim();
			const user = await User
				.findOne({ email: normalizedEmail })
				.select("+password");

			if (!user) {
				throw new AuthenticationError("Invalid credentials");
			}
			if (!user.isVerified) {
				throw new AuthenticationError("Account not verified. Please verify your OTP to login.");
			}
			if (user.isBanned) {
				throw new AuthenticationError("Account is banned.");
			}
			if (user.lockUntil && user.lockUntil > Date.now()) {
				throw new AuthenticationError(
					"Account locked. Try again later"
				);

			}
			const isValid = await user.comparePassword(password);
			if (!isValid) {
				user.failedLoginAttempts += 1;
				if (user.failedLoginAttempts >= 5) {
					user.lockUntil =
						Date.now() + 15 * 60 * 1000; // 15 min
				}
				await user.save();
				throw new AuthenticationError(
					"Invalid credentials"
				);

			}
			user.failedLoginAttempts = 0;
			user.lockUntil = undefined;
			user.lastLogin = new Date();

			await user.save();
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
				//  { new: true } tells Mongoose to return the modified document after the update has been applied.
			);

			if (!user) {
				throw new NotFoundError("User not found");
			}

			// for auto-login
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
				// Any other fields that already exist on the user document but aren't in updateData will be left untouched
				{ new: true, runValidators: true }
				// new: true: Just like before, this ensures the method returns the updated document rather than the original (pre-update) document.
				// runValidators: true: By default, Mongoose only runs your schema validations (like required, minLength, enum, etc.) when you create or .save() a new document, but not during update operations. Setting this to true forces Mongoose to validate the updateData against your User schema rules before applying the update, preventing invalid data from being saved.
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