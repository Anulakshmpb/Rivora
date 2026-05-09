const express = require('express');
const CouponController = require('../Controllers/CouponController');
const { authenticateAdmin, authenticateUserOrAdmin } = require('../Middlewares/auth');

const router = express.Router();

router.get('/', authenticateAdmin, CouponController.getAll);
router.post('/', authenticateAdmin, CouponController.create);
router.put('/:id', authenticateAdmin, CouponController.update);
router.delete('/:id', authenticateAdmin, CouponController.delete);
router.post('/validate', authenticateUserOrAdmin, CouponController.validate);

module.exports = router;
