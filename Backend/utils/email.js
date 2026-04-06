const nodemailer = require('nodemailer');
const logger = require('./logger');
const { AppError } = require('./errors');
const templates = require('./emailTemplates');

class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			service: process.env.EMAIL_SERVICE,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS
			},
			pool: true, // Use connection pooling for efficiency
			maxConnections: 5,
			maxMessages: 100
		});

		// Verify transporter configuration on initialization
		this.transporter.verify((error, success) => {
			if (error) {
				logger.error('Email transporter verification failed:', error);
			} else {
				logger.info('Email service initialized and ready to send.');
			}
		});
	}


	async _send(to, subject, htmlContent) {
		try {
			const mailOptions = {
				from: `Rivora Ecommerce <${process.env.EMAIL_USER}>`,
				to: to,
				subject: subject,
				html: htmlContent, // Send HTML for professional appearance
				text: htmlContent.replace(/<[^>]*>?/gm, '') // Fallback text version
			};

			const info = await this.transporter.sendMail(mailOptions);
			logger.info('Email sent successfully:', {
				messageId: info.messageId,
				to: to,
				subject: subject
			});
			return info;
		} catch (error) {
			logger.error('Failed to send email:', {
				to: to,
				subject: subject,
				error: error.message
			});
			throw new AppError('Email service failed to send message.', 500, 'EMAIL_SERVICE_ERROR');
		}
	}

	async sendOTP(email, otp) {
		const html = templates.otp(otp);
		return await this._send(email, 'Your Verification Code - Rivora', html);
	}

	async sendPasswordReset(email, resetUrl) {
		const html = templates.passwordReset(resetUrl);
		return await this._send(email, 'Password Reset Request - Rivora', html);
	}

	async sendOrderConfirmation(email, orderDetails) {
		const html = templates.orderConfirmation(orderDetails);
		return await this._send(email, 'Order Confirmed - Rivora', html);
	}

	async sendOrderFailed(email, orderDetails, reason) {
		const html = templates.orderFailed(orderDetails, reason);
		return await this._send(email, 'Order Payment Failed - Rivora', html);
	}

	async sendGeneralMessage(email, subject, message) {
		const html = templates.generalMessage(subject, message);
		return await this._send(email, subject, html);
	}
}

// Export as a singleton instance
module.exports = new EmailService();
