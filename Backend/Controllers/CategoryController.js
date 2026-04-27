const BaseController = require('./BaseController');
const Category = require('../Modals/Category');

class CategoryController extends BaseController {
    static getAll = BaseController.asyncHandler(async (req, res) => {
        const categories = await Category.find().sort({ name: 1 });
        BaseController.sendSuccess(res, 'Categories retrieved successfully', { categories });
    });

    static create = BaseController.asyncHandler(async (req, res) => {
        const { name, description } = req.body;
        
        if (!name) {
            return BaseController.sendError(res, 'Category name is required', 400);
        }

        const existing = await Category.findOne({ name: name.trim() });
        if (existing) {
            return BaseController.sendError(res, 'Category already exists', 400);
        }

        const category = await Category.create({
            name: name.trim(),
            description,
            createdBy: req.admin?._id || req.user?._id
        });

        BaseController.logAction('CATEGORY_CREATE', req, { categoryId: category._id });
        BaseController.sendSuccess(res, 'Category created successfully', { category }, 201);
    });

    static update = BaseController.asyncHandler(async (req, res) => {
        const { name, description } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name: name.trim(), description },
            { new: true, runValidators: true }
        );

        if (!category) {
            return BaseController.sendError(res, 'Category not found', 404);
        }

        BaseController.logAction('CATEGORY_UPDATE', req, { categoryId: category._id });
        BaseController.sendSuccess(res, 'Category updated successfully', { category });
    });

    static delete = BaseController.asyncHandler(async (req, res) => {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return BaseController.sendError(res, 'Category not found', 404);
        }

        BaseController.logAction('CATEGORY_DELETE', req, { categoryId: category._id });
        BaseController.sendSuccess(res, 'Category deleted successfully');
    });
}

module.exports = CategoryController;
