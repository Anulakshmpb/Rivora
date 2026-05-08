const BaseController = require('./BaseController');
const HomeCategory = require('../Modals/HomeCategory');

class HomeCategoryController extends BaseController {
	static getAll = BaseController.asyncHandler(async (req, res) => {
		const items = await HomeCategory.find().sort({ createdAt: -1 });
		BaseController.sendSuccess(res, 'Home categories retrieved successfully', { items });
	});

	static create = BaseController.asyncHandler(async (req, res) => {
		const { title, description, buttonText, link } = req.body;
		const image = req.file ? `/uploads/${req.file.filename}` : null;

		if (!title || !description || !buttonText || !link || !image) {
			return BaseController.sendError(res, 'All fields are required (title, description, buttonText, link, image)', 400);
		}

		const item = await HomeCategory.create({
			title: title.trim(),
			description: description.trim(),
			buttonText: buttonText.trim(),
			link: link.trim(),
			image: image,
			createdBy: req.admin?._id
		});

		BaseController.logAction('HOME_CATEGORY_CREATE', req, { itemId: item._id });
		BaseController.sendSuccess(res, 'Home category created successfully', { item }, 201);
	});

	static update = BaseController.asyncHandler(async (req, res) => {
		const { title, description, buttonText, link } = req.body;
		
		const updateData = {
			title: title?.trim(),
			description: description?.trim(),
			buttonText: buttonText?.trim(),
			link: link?.trim()
		};

		if (req.file) {
			updateData.image = `/uploads/${req.file.filename}`;
		}

		const item = await HomeCategory.findByIdAndUpdate(
			req.params.id,
			updateData,
			{ new: true, runValidators: true }
		);

		if (!item) {
			return BaseController.sendError(res, 'Home category not found', 404);
		}

		BaseController.logAction('HOME_CATEGORY_UPDATE', req, { itemId: item._id });
		BaseController.sendSuccess(res, 'Home category updated successfully', { item });
	});

	static delete = BaseController.asyncHandler(async (req, res) => {
		const item = await HomeCategory.findByIdAndDelete(req.params.id);

		if (!item) {
			return BaseController.sendError(res, 'Home category not found', 404);
		}

		BaseController.logAction('HOME_CATEGORY_DELETE', req, { itemId: item._id });
		BaseController.sendSuccess(res, 'Home category deleted successfully');
	});
}

module.exports = HomeCategoryController;
