const express = require('express');
const ReviewController = require('../Controllers/ReviewController');
const upload = require('../Middlewares/multer');

const router = express.Router();
router.post('/', upload.single('img'), ReviewController.create);
router.get('/', ReviewController.getReviews);

module.exports = router;
