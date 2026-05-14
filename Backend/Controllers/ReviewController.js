const Review = require('../Modals/Review');
const logger = require('../utils/logger');

const ReviewController = {
    create: async (req, res, next) => {
        try {
            const { name, email, rating, review, type, productId } = req.body;
            let imgPath = '';

            if (req.file) {
                imgPath = `/uploads/${req.file.filename}`;
            }

            const newReview = await Review.create({
                name,
                email,
                rating,
                review,
                type,
                productId: productId || null,
                img: imgPath
            });

            res.status(201).json({
                success: true,
                message: 'Review submitted successfully',
                review: newReview
            });
        } catch (error) {
            logger.error('Error creating review:', error);
            next(error);
        }
    },

    getReviews: async (req, res, next) => {
        try {
            const { type, productId } = req.query;
            const filter = {};
            
            if (type) filter.type = type;
            if (productId) filter.productId = productId;

            const reviews = await Review.find(filter).sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                reviews
            });
        } catch (error) {
            logger.error('Error fetching reviews:', error);
            next(error);
        }
    }
};

module.exports = ReviewController;
