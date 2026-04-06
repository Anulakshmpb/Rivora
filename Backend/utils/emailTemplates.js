
const baseStyle = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
`;

const headerStyle = `
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 2px solid #f4f4f4;
`;

const buttonStyle = `
    display: inline-block;
    padding: 12px 24px;
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    margin-top: 20px;
`;

const footerStyle = `
    text-align: center;
    font-size: 12px;
    color: #888;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #f4f4f4;
`;

const getBaseTemplate = (content) => `
    <div style="${baseStyle}">
        <div style="${headerStyle}">
            <h1 style="color: #007bff; margin: 0;">Rivora Ecommerce</h1>
        </div>
        <div style="padding: 20px 0;">
            ${content}
        </div>
        <div style="${footerStyle}">
            <p>&copy; ${new Date().getFullYear()} Rivora Ecommerce. All rights reserved.</p>
            <p>If you have any questions, contact our support team.</p>
        </div>
    </div>
`;

const templates = {
    otp: (otp) => getBaseTemplate(`
        <h2>Verification Code</h2>
        <p>Hello,</p>
        <p>Your one-time password (OTP) for account verification is:</p>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; border: 1px dashed #007bff; color: #007bff;">
            ${otp}
        </div>
        <p>This code is valid for 10 minutes. Please do not share this code with anyone.</p>
    `),

    passwordReset: (resetUrl) => getBaseTemplate(`
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center;">
            <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
        <p style="font-size: 11px; color: #999;">If the button doesn't work, copy and paste this link: <br> ${resetUrl}</p>
    `),

    orderConfirmation: (orderDetails) => getBaseTemplate(`
        <h2>Order Confirmed!</h2>
        <p>Hello ${orderDetails.customerName},</p>
        <p>Thank you for your order! We're processing it and will notify you when it ships.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
        </div>
        <p>You can track your order status in your account dashboard.</p>
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/account/orders" style="${buttonStyle}">View Order</a>
        </div>
    `),

    orderFailed: (orderDetails, reason) => getBaseTemplate(`
        <h2 style="color: #dc3545;">Order Payment Failed</h2>
        <p>Hello ${orderDetails.customerName},</p>
        <p>We're sorry, but there was an issue processing your order <strong>#${orderDetails.orderId}</strong>.</p>
        <p><strong>Reason:</strong> ${reason || 'Payment declined or technical error'}</p>
        <p>Please try again or use a different payment method.</p>
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/checkout" style="${buttonStyle}">Try Again</a>
        </div>
    `),

    generalMessage: (subject, message) => getBaseTemplate(`
        <h2>${subject}</h2>
        <p>Hello,</p>
        <p>${message}</p>
    `)
};

module.exports = templates;
