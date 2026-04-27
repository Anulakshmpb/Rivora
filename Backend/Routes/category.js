const express = require('express');
const CategoryController = require('../Controllers/CategoryController');
const { authenticateAdmin } = require('../Middlewares/auth');
const checkUserStatus = require('../Middlewares/checkUserStatus');

const router = express.Router();

// Publicly accessible to authenticated users/admins
router.get('/', CategoryController.getAll);

// Admin only actions
router.post('/', checkUserStatus, authenticateAdmin, CategoryController.create);
router.put('/:id', checkUserStatus, authenticateAdmin, CategoryController.update);
router.delete('/:id', checkUserStatus, authenticateAdmin, CategoryController.delete);

module.exports = router;
