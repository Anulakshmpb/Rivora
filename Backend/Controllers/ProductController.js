const BaseController = require('./BaseController');
const ProductService = require('../Services/ProductService');
const { matchedData } = require('express-validator');

class ProductController extends BaseController {
	static getAll = BaseController.asyncHandler(async (req, res) => {
		const ownerId = req.admin ? null : (req.user?._id || null);
		const { search, category, minPrice, maxPrice, rating } = req.query;

		const queryOptions = {
			search,
			category,
			minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
			maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
			rating: rating !== undefined ? Number(rating) : undefined
		};

		const products = await ProductService.getAll(ownerId, !!req.admin, queryOptions);
		BaseController.sendSuccess(res, 'Products received successfully', { products });
	});

	static getOne = BaseController.asyncHandler(async (req, res) => {
		const ownerId = req.admin ? null : (req.user?._id || null);
		const product = await ProductService.getOne(req.params.id, ownerId, !!req.admin);
		BaseController.sendSuccess(res, 'Product received successfully', { product });
	});

	static create = BaseController.asyncHandler(async (req, res) => {
		const validatedData = matchedData(req, { includeOptionals: true });
		const ownerId = req.user?._id || req.admin?._id;
		const product = await ProductService.create(ownerId, validatedData);
		BaseController.logAction('PRODUCT_CREATE', req);
		BaseController.sendSuccess(res, 'Product created successfully', { product }, 201);
	});

	static update = BaseController.asyncHandler(async (req, res) => {
		const validatedData = matchedData(req, { includeOptionals: true });
		const ownerId = req.admin ? null : (req.user?._id || null);
		let productId = req.params.id;
		if (productId && productId.includes(':')) {
			productId = productId.split(':')[0];
		}
		productId = productId.trim();

		const product = await ProductService.update(productId, ownerId, validatedData);
		BaseController.logAction('PRODUCT_UPDATED', req);
		BaseController.sendSuccess(res, 'Product updated successfully', { product });
	});

	static delete = BaseController.asyncHandler(async (req, res) => {
		const ownerId = req.admin ? null : (req.user?._id || null);
		await ProductService.delete(req.params.id, ownerId);
		BaseController.logAction('PRODUCT_DELETE', req);
		BaseController.sendSuccess(res, 'Product deleted successfully');
	});
}

module.exports = ProductController;