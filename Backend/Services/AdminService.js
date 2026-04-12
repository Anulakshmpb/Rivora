const Admin = require('../Modals/Admin');
const { generateAdminToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { AuthenticationError, NotFoundError } = require('../utils/errors');

class AdminAuthService {

	static async login(credentials) {

		try {

			const { email, password } = credentials;

			// Normalize email
			const normalizedEmail =
				email.toLowerCase().trim();

			// Find admin with password
			const admin = await Admin
				.findOne({ email: normalizedEmail })
				.select("+password");

			if (!admin) {

				throw new AuthenticationError(
					"Invalid admin credentials"
				);

			}

			// Check role
			if (admin.role !== "admin") {

				throw new AuthenticationError(
					"Access denied. Admin only"
				);

			}

			// Check account verification (Admin schema currently doesn't have isVerified but we check status)
			if (admin.status === "banned") {
                throw new AuthenticationError("Admin account banned");
            }

			// Check password
			const isValid =
				await admin.comparePassword(password);

			if (!isValid) {

				throw new AuthenticationError(
					"Invalid admin credentials"
				);

			}


			// Update last login
			admin.lastLogin = new Date();

			await admin.save();

			// Generate token
			const token = generateAdminToken({

				id: admin._id,
				role: admin.role

			});

			logger.info(
				`Admin login: ${admin.email}`
			);

			return {

				admin: admin.getPublicProfile(),
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