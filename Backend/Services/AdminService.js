const Admin = require('../Modals/Admin');
const { generateAdminToken } = require('../utils/jwt');
const logger = require('../utils/logger');
const { AuthenticationError, NotFoundError } = require('../utils/errors');

class AdminAuthService {

	static async login(credentials) {

		try {

			const { email, password } = credentials;

			const normalizedEmail =
				email.toLowerCase().trim();
			const admin = await Admin
				.findOne({ email: normalizedEmail })
				.select("+password");

			if (!admin) {

				throw new AuthenticationError(
					"Invalid admin credentials"
				);

			}
			if (admin.role !== "admin") {

				throw new AuthenticationError(
					"Access denied. Admin only"
				);

			}

			if (admin.status === "banned") {
                throw new AuthenticationError("Admin account banned");
            }
			const isValid =
				await admin.comparePassword(password);

			if (!isValid) {

				throw new AuthenticationError(
					"Invalid admin credentials"
				);

			}
			admin.lastLogin = new Date();

			await admin.save();
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