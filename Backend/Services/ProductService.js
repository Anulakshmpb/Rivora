const Product = require('../Modals/Product');
const logger = require('../utils/logger');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

class ProductService {
  static async getAll(userId = null) {
    const filter = userId ? { user: userId } : {};
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  static async getOne(productId, userId = null) {
    const filter = userId ? { _id: productId, user: userId } : { _id: productId };
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

    await product.deleteOne();
    logger.info(`Product deleted: ${productId}`);
    return true;
  }
}

module.exports = ProductService;
