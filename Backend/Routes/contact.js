const express = require('express');
const ContactController = require('../Controllers/ContactController');
const { authenticateAdmin } = require('../Middlewares/auth');

const router = express.Router();

// Public route to get contact info
router.get('/', ContactController.getContact);

// Admin route to update contact info
router.put('/', authenticateAdmin, ContactController.updateContact);

module.exports = router;
