const express = require('express');
const ReviewController = require('../Controllers/ReviewController');
const upload = require('../Middlewares/multer');
const s3Upload = require('../Middlewares/s3Upload');

const router = express.Router();
router.post('/', upload.single('img'), s3Upload('reviews'), ReviewController.create);
router.get('/', ReviewController.getReviews);

module.exports = router;
