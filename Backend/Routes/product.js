const express = require('express');
const ProductController = require('../Controllers/ProductController');
const { authenticateUserOrAdmin } = require('../Middlewares/auth');
const checkUserStatus = require('../Middlewares/checkUserStatus');
const upload = require('../Middlewares/multer');

const router = express.Router();

// Public
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);

// Protected 
router.use(checkUserStatus, authenticateUserOrAdmin);

router.post('/', upload.array('image'), ProductController.create);
router.put('/:id', upload.array('image'), ProductController.update);
router.delete('/:id', ProductController.delete);


module.exports = router;
