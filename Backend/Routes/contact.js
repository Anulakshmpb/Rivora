const express = require('express');
const ContactController = require('../Controllers/ContactController');
const { authenticateAdmin } = require('../Middlewares/auth');

const router = express.Router();

// Public route
router.get('/', ContactController.getContact);
// admin auth
router.put('/', authenticateAdmin, ContactController.updateContact);

module.exports = router;
