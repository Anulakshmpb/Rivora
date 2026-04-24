const OTP = require('../Modals/Otp');
const crypto = require('crypto');
const { generateOTP } = require('../utils/generateotp');
const { sendOTPEmail } = require('./EmailService');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

class OTPService {

	static hashOTP(otp) {
		return crypto
			.createHash('sha256')
			.update(otp.toString())
			.digest('hex');
	}

	static async createOTP(user, type = "emailVerification") {
		const otp = generateOTP();
		const hashedOTP = this.hashOTP(otp);
		const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

		// Remove previous OTP of this type
		await OTP.deleteMany({
			userId: user._id,
			type: type
		});

		await OTP.create({
			userId: user._id,
			otp: hashedOTP,
			type: type,
			attempts: 0,
			expiresAt
		});

		await sendOTPEmail(user.email, otp);
	}

	static async verifyOTP(userId, enteredOTP, type = "emailVerification") {
		const record = await OTP.findOne({
			userId,
			type: type
		});

		if (!record)
			throw new Error("OTP expired or not found");
		if (record.expiresAt < new Date()) {
			await OTP.deleteOne({ _id: record._id });
			throw new Error("OTP expired");
		}

		if (record.attempts >= MAX_ATTEMPTS) {
			throw new Error("Maximum attempts exceeded");
		}

		const hashed = this.hashOTP(enteredOTP);

		if (hashed !== record.otp) {
			record.attempts += 1;
			await record.save();
			throw new Error("Invalid OTP");
		}
		await OTP.deleteOne({ _id: record._id });

		return true;
	}

	static async resendOTP(user, type = "emailVerification") {
		const existing = await OTP.findOne({
			userId: user._id,
			type: type
		});
		if (existing) {
			const timeLeft = existing.createdAt.getTime() + 60000;
			if (Date.now() < timeLeft) {
				throw new Error("Wait before requesting new OTP");
			}
		}

		await this.createOTP(user, type);
	}

	static async deleteOTP(userId) {
		await OTP.deleteMany({ userId });
	}

}

module.exports = OTPService;