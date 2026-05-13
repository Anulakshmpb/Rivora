const BaseController = require('./BaseController');
const Coupon = require('../Modals/Coupons');

class CouponController extends BaseController {
    static getAll = BaseController.asyncHandler(async (req, res) => {
        const coupons = await Coupon.find().sort({ expiryDate: 1 });
        BaseController.sendSuccess(res, 'Coupons retrieved successfully', { coupons });
    });

    static getActive = BaseController.asyncHandler(async (req, res) => {
        const now = new Date();
        const coupons = await Coupon.find({
            expiryDate: { $gte: now }
        }).sort({ discount: -1 });
        BaseController.sendSuccess(res, 'Active coupons retrieved successfully', { coupons });
    });

    static create = BaseController.asyncHandler(async (req, res) => {
        const { name, code, discount, minAmount, expiryDate } = req.body;

        if (!name || !code || !discount || minAmount === undefined || !expiryDate) {
            return BaseController.sendError(res, 'All fields are required', 400);
        }

        const existingCode = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            return BaseController.sendError(res, 'Coupon code already exists', 400);
        }

        const coupon = await Coupon.create({
            name,
            code: code.toUpperCase(),
            discount,
            minAmount,
            expiryDate
        });

        BaseController.logAction('COUPON_CREATE', req, { couponId: coupon._id });
        BaseController.sendSuccess(res, 'Coupon created successfully', { coupon }, 201);
    });

    static update = BaseController.asyncHandler(async (req, res) => {
        const { name, code, discount, minAmount, expiryDate } = req.body;

        if (code) {
            const existing = await Coupon.findOne({
                code: code.toUpperCase(),
                _id: { $ne: req.params.id }
            });

            if (existing) {
                return BaseController.sendError(res, 'Coupon code already exists', 400);
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { name, code: code?.toUpperCase(), discount, minAmount, expiryDate },
            { new: true, runValidators: true }
        );

        if (!coupon) {
            return BaseController.sendError(res, 'Coupon not found', 404);
        }

        BaseController.logAction('COUPON_UPDATE', req, { couponId: coupon._id });
        BaseController.sendSuccess(res, 'Coupon updated successfully', { coupon });
    });

    static delete = BaseController.asyncHandler(async (req, res) => {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return BaseController.sendError(res, 'Coupon not found', 404);
        }

        BaseController.logAction('COUPON_DELETE', req, { couponId: coupon._id });
        BaseController.sendSuccess(res, 'Coupon deleted successfully');
    });

    static validate = BaseController.asyncHandler(async (req, res) => {
        const { code, cartTotal } = req.body;

        if (!code) {
            return BaseController.sendError(res, 'Coupon code is required', 400);
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return BaseController.sendError(res, 'Invalid coupon code', 404);
        }

        const isExpired = new Date(coupon.expiryDate) < new Date();
        if (isExpired) {
            return BaseController.sendError(res, 'Coupon has expired', 400);
        }

        if (cartTotal && cartTotal < coupon.minAmount) {
            return BaseController.sendError(res, `This coupon requires a minimum purchase of ₹${coupon.minAmount}`, 400);
        }

        BaseController.sendSuccess(res, 'Coupon applied successfully', {
            code: coupon.code,
            discount: coupon.discount,
            name: coupon.name,
            minAmount: coupon.minAmount
        });
    });
}

module.exports = CouponController;