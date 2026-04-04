const User = require('../models/User');
const { generateUserToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { AuthenticationError, NotFoundError } = require('../utils/errors');

class AdminAuthService {

	static async login(credentials) {

		try {

			const { email, password } = credentials;

			// Normalize email
			const normalizedEmail =
				email.toLowerCase().trim();

			// Find user with password
			const user = await User
				.findOne({ email: normalizedEmail })
				.select("+password");

			if (!user) {

				throw new AuthenticationError(
					"Invalid admin credentials"
				);

			}

			// Check role
			if (user.role !== "admin") {

				throw new AuthenticationError(
					"Access denied. Admin only"
				);

			}

			// Check account verification
			if (!user.isVerified) {

				throw new AuthenticationError(
					"Admin account not verified"
				);

			}

			// Check password
			const isValid =
				await user.comparePassword(password);

			if (!isValid) {

				throw new AuthenticationError(
					"Invalid admin credentials"
				);

			}

			// Update last login
			user.lastLogin = new Date();

			await user.save();

			// Generate token
			const token = generateUserToken({

				id: user._id,
				role: user.role

			});

			logger.info(
				`Admin login: ${user.email}`
			);

			return {

				admin: user.getPublicProfile(),
				token

			};

		}
		catch (error) {

			logger.error(
				"Admin login error",
				error
			);

			throw error;

		}

	}

}

module.exports = AdminAuthService;