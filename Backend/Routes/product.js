const express = require('express');
const ProductController = require('../Controllers/ProductController');
const { authenticateUserOrAdmin } = require('../Middlewares/auth');
const checkUserStatus = require('../Middlewares/checkUserStatus');

const router = express.Router();

router.use(checkUserStatus, authenticateUserOrAdmin);

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

module.exports = router;

