const express = require('express');
const ProductController = require('../Controllers/ProductController');
const { authenticateUserOrAdmin } = require('../Middlewares/auth');
const checkUserStatus = require('../Middlewares/checkUserStatus');
const upload = require('../Middlewares/multer');
const s3Upload = require('../Middlewares/s3Upload');
const {
  preprocessProductData,
  validateCreateProduct,
  validateUpdateProduct
} = require('../Middlewares/validation');

const router = express.Router();

// Public
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);

// Protected 
router.use(checkUserStatus, authenticateUserOrAdmin);

router.post('/', upload.array('image'), s3Upload('products'), preprocessProductData, validateCreateProduct, ProductController.create);
router.put('/:id', upload.array('image'), s3Upload('products'), preprocessProductData, validateUpdateProduct, ProductController.update);
router.delete('/:id', ProductController.delete);

module.exports = router;
