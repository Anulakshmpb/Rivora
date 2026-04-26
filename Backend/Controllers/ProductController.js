const BaseController = require('./BaseController');
const ProductService = require('../Services/ProductService');
const { createProductValidation, updateProductValidation } = require('../utils/validation');

class ProductController extends BaseController {
	static getAll = BaseController.asyncHandler(async (req, res) => {
		const ownerId = req.admin ? null : (req.user?._id || null);
		const products = await ProductService.getAll(ownerId);
		BaseController.sendSuccess(res, 'Products received successfully', { products });
	});

	static getOne = BaseController.asyncHandler(async (req, res) => {
		const ownerId = req.admin ? null : (req.user?._id || null);
		const product = await ProductService.getOne(req.params.id, ownerId);
		BaseController.sendSuccess(res, 'Product received successfully', { product });
	});

	static create = BaseController.asyncHandler(async (req, res) => {
		const validatedData = BaseController.validateRequest(createProductValidation, req.body);
		const ownerId = req.user?._id || req.admin?._id;
		const product = await ProductService.create(ownerId, validatedData);
		BaseController.logAction('PRODUCT_CREATE', req);
		BaseController.sendSuccess(res, 'Product created successfully', { product }, 201);
	});

	static update = BaseController.asyncHandler(async (req, res) => {
		const validatedData = BaseController.validateRequest(updateProductValidation, req.body);
		const ownerId = req.admin ? null : (req.user?._id || null);
		const product = await ProductService.update(req.params.id, ownerId, validatedData);
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