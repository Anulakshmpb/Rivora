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
		// Handle images from req.files
		if (req.files && req.files.length > 0) {
			req.body.image = req.files.map(file => `/uploads/${file.filename}`);
		}

		// Parse JSON strings for array fields if they come from FormData
		['category', 'size', 'color'].forEach(field => {
			if (typeof req.body[field] === 'string') {
				try {
					req.body[field] = JSON.parse(req.body[field]);
				} catch (e) {
					// If parsing fails, keep it as is or handle appropriately
					if (req.body[field].includes(',')) {
						req.body[field] = req.body[field].split(',').map(s => s.trim());
					} else {
						req.body[field] = [req.body[field]];
					}
				}
			}
		});

		const validatedData = BaseController.validateRequest(createProductValidation, req.body);
		const ownerId = req.user?._id || req.admin?._id;
		const product = await ProductService.create(ownerId, validatedData);
		BaseController.logAction('PRODUCT_CREATE', req);
		BaseController.sendSuccess(res, 'Product created successfully', { product }, 201);
	});

	static update = BaseController.asyncHandler(async (req, res) => {
		// Handle images from req.files
		if (req.files && req.files.length > 0) {
			const newImages = req.files.map(file => `/uploads/${file.filename}`);
			
			// If existing images are sent in body, combine them
			let existingImages = [];
			if (req.body.image) {
				try {
					existingImages = typeof req.body.image === 'string' ? JSON.parse(req.body.image) : req.body.image;
				} catch (e) {
					existingImages = Array.isArray(req.body.image) ? req.body.image : [req.body.image];
				}
			}
			req.body.image = [...existingImages, ...newImages];
		} else if (req.body.image && typeof req.body.image === 'string') {
			// If no new files but image field is string (JSON), parse it
			try {
				req.body.image = JSON.parse(req.body.image);
			} catch (e) {
				req.body.image = [req.body.image];
			}
		}

		// Parse JSON strings for array fields if they come from FormData
		['category', 'size', 'color'].forEach(field => {
			if (typeof req.body[field] === 'string') {
				try {
					req.body[field] = JSON.parse(req.body[field]);
				} catch (e) {
					if (req.body[field].includes(',')) {
						req.body[field] = req.body[field].split(',').map(s => s.trim());
					} else {
						req.body[field] = [req.body[field]];
					}
				}
			}
		});

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