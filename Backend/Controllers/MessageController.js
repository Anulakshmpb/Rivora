const BaseController = require('./BaseController');
const Message = require('../Modals/Message');
const emailService = require('../utils/email');

class MessageController extends BaseController {
    static sendMessage = BaseController.asyncHandler(async (req, res) => {
        const { name, email, subject, message } = req.body;
        const newMessage = await Message.create({
            name,
            email,
            subject,
            message
        });

        BaseController.sendSuccess(res, 'Message sent successfully', { message: newMessage }, 201);
    });

    static getMessages = BaseController.asyncHandler(async (req, res) => {
        const messages = await Message.find().sort({ createdAt: -1 });
        BaseController.sendSuccess(res, 'Messages retrieved successfully', { messages });
    });

    static markAsRead = BaseController.asyncHandler(async (req, res) => {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (!message) {
            return BaseController.sendError(res, 'Message not found', 404);
        }
        message.isRead = true;
        await message.save();

        BaseController.sendSuccess(res, 'Message marked as read', { message });
    });

    static replyToMessage = BaseController.asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { replyText } = req.body;

        if (!replyText) {
            return BaseController.sendError(res, 'Reply text is required', 400);
        }

        const message = await Message.findById(id);

        if (!message) {
            return BaseController.sendError(res, 'Message not found', 404);
        }
        const subject = `Re: ${message.subject}`;
        await emailService.sendGeneralMessage(message.email, subject, replyText);
        if (!message.isRead) {
            message.isRead = true;
            await message.save();
        }

        BaseController.sendSuccess(res, 'Reply sent successfully', { message });
    });
}

module.exports = MessageController;
