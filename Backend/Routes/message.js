const express = require('express');
const MessageController = require('../Controllers/MessageController');
const { authenticateAdmin } = require('../Middlewares/auth');

const router = express.Router();

router.post('/', MessageController.sendMessage);
router.get('/', authenticateAdmin, MessageController.getMessages);
router.patch('/:id/read', authenticateAdmin, MessageController.markAsRead);

// Admin route to reply to a message
router.post('/:id/reply', authenticateAdmin, MessageController.replyToMessage);

module.exports = router;
