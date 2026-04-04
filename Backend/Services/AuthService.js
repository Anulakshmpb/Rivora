const User = require('../models/User');
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
				throw new ConflictError("User already exists");
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

}

module.exports = AuthService;