const express = require('express');
const HomeCategoryController = require('../Controllers/HomeCategoryController');
const { authenticateAdmin } = require('../Middlewares/auth');
const upload = require('../Middlewares/multer');

const router = express.Router();

router.get('/', HomeCategoryController.getAll);
router.post('/', authenticateAdmin, upload.single('image'), HomeCategoryController.create);
router.put('/:id', authenticateAdmin, upload.single('image'), HomeCategoryController.update);
router.delete('/:id', authenticateAdmin, HomeCategoryController.delete);

module.exports = router;
