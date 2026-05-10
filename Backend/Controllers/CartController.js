const Cart = require('../Modals/Cart');
const { sendSuccess, sendError } = require('../utils/response');

const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        let cart = await Cart.findOne({ user: userId }).populate('items.product');
        
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }
        
        return sendSuccess(res, 'Cart fetched successfully', cart);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity, size, color } = req.body;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId && item.size === size && item.color === color
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += (quantity || 1);
        } else {
            cart.items.push({ product: productId, quantity, size, color });
        }

        await cart.save();
        const populatedCart = await cart.populate('items.product');
        return sendSuccess(res, 'Item added to cart', populatedCart);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const updateQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity, size, color } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return sendError(res, 'Cart not found', 404);

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId && item.size === size && item.color === color
        );

        if (itemIndex === -1) return sendError(res, 'Item not found in cart', 404);

        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        
        const populatedCart = await cart.populate('items.product');
        return sendSuccess(res, 'Cart updated', populatedCart);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, size, color } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return sendError(res, 'Cart not found', 404);

        cart.items = cart.items.filter(
            item => !(item.product.toString() === productId && item.size === size && item.color === color)
        );

        await cart.save();
        const populatedCart = await cart.populate('items.product');
        return sendSuccess(res, 'Item removed from cart', populatedCart);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return sendSuccess(res, 'Cart cleared', cart);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
};
