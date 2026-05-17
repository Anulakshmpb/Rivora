const config = require('../Config/config');
const { createAuthLimiter } = require('../Middlewares/setup');

const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const productRoutes = require('./product');
const categoryRoutes = require('./category');
const homeCategoryRoutes = require('./homeCategory');
const couponRoutes = require('./coupon');
const orderRoutes = require('./order');
const cartRoutes = require('./cart');
const walletRoutes = require('./wallet');
const reviewRoutes = require('./review');
const contactRoutes = require('./contact');

const setupRoutes = (app) => {
    const authLimiter = createAuthLimiter();
    const shouldUseAuthLimiter = config.NODE_ENV === 'production';

    app.use('/api/auth', shouldUseAuthLimiter ? authLimiter : [], authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/home-categories', homeCategoryRoutes);
    app.use('/api/coupons', couponRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/wallet', walletRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/contact', contactRoutes);
};

module.exports = {
    setupRoutes
};
