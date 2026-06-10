const Product = require('../Modals/Product');
const logger = require('../utils/logger');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const s3Service = require('./s3Service');


class ProductService {
  static async getAll(userId = null, isAdmin = false, queryOptions = {}) {
    const filter = {};
    if (userId) {
      filter.user = userId;
    }
    if (!isAdmin) {
      filter.isVisible = true;
    }

    // 1. Keyword-based search (name/description)
    if (queryOptions.search) {
      const searchRegex = new RegExp(queryOptions.search, 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }

    // 2. Filter by category
    if (queryOptions.category) {
      filter.category = queryOptions.category;
    }

    // 3. Filter by price range
    if (queryOptions.minPrice !== undefined || queryOptions.maxPrice !== undefined) {
      filter.price = {};
      if (queryOptions.minPrice !== undefined) filter.price.$gte = queryOptions.minPrice;
      if (queryOptions.maxPrice !== undefined) filter.price.$lte = queryOptions.maxPrice;
    }

    // 4. Filter by rating
    if (queryOptions.rating !== undefined) {
      const Review = require('../Modals/Review');
      const minRating = parseFloat(queryOptions.rating);
      const ratings = await Review.aggregate([
        { $match: { type: 'product' } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
        { $match: { avgRating: { $gte: minRating } } }
      ]);
      const productIdsWithRating = ratings.map(r => r._id);
      filter._id = { $in: productIdsWithRating };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    // Enrich with dynamic review statistics
    const Review = require('../Modals/Review');
    const enrichedProducts = await Promise.all(products.map(async (product) => {
      const reviews = await Review.find({ productId: product._id, type: 'product' });
      const reviewCount = reviews.length;
      const avgRating = reviewCount > 0 
        ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;
      
      const productObj = product.toObject();
      return {
        ...productObj,
        avgRating,
        reviewCount
      };
    }));

    return enrichedProducts;
  }

  static async getOne(productId, userId = null, isAdmin = false) {
    const filter = userId ? { _id: productId, user: userId } : { _id: productId };
    if (!isAdmin) {
      filter.isVisible = true;
    }
    const product = await Product.findOne(filter);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  static async create(userId, data) {
    const product = new Product({
      ...data,
      user: userId
    });
    await product.save();
    logger.info(`Product created: ${product._id}`);
    return product;
  }

  static async update(productId, userId, data) {
    const filter = userId ? { _id: productId, user: userId } : { _id: productId };
    const product = await Product.findOne(filter);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // If new images are provided, check if any old images were removed and delete them from S3
    if (data.image && Array.isArray(data.image)) {
      const oldImages = product.image || [];
      const newImages = data.image;
      const removedImages = oldImages.filter(img => !newImages.includes(img));
      
      for (const imgUrl of removedImages) {
        const key = s3Service.getS3KeyFromUrl(imgUrl);
        if (key) {
          await s3Service.deleteImage(key);
        }
      }
    }

    Object.assign(product, data);
    await product.save();

    logger.info(`Product updated: ${productId}`);
    return product;
  }

  static async delete(productId, userId) {
    const filter = userId ? { _id: productId, user: userId } : { _id: productId };
    const product = await Product.findOne(filter);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Delete all S3 images associated with the product
    if (product.image && Array.isArray(product.image)) {
      for (const imgUrl of product.image) {
        const key = s3Service.getS3KeyFromUrl(imgUrl);
        if (key) {
          await s3Service.deleteImage(key);
        }
      }
    }

    await product.deleteOne();
    try {
      const Cart = require('../Modals/Cart');
      await Cart.updateMany(
        { "items.product": productId },
        { $pull: { items: { product: productId } } }
      );
      logger.info(`Product deleted and pulled from all carts: ${productId}`);
    } catch (cartErr) {
      logger.error(`Failed to pull deleted product ${productId} from carts:`, cartErr);
    }

    return true;
  }
}

module.exports = ProductService;
