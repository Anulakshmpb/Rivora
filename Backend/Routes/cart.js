const express = require('express');
const router = express.Router();
const CartController = require('../Controllers/CartController');
const { authenticateUser } = require('../Middlewares/auth');

router.get('/', authenticateUser, CartController.getCart);
router.post('/add', authenticateUser, CartController.addToCart);
router.put('/update', authenticateUser, CartController.updateQuantity);
router.delete('/remove', authenticateUser, CartController.removeFromCart);
router.delete('/clear', authenticateUser, CartController.clearCart);

module.exports = router;
