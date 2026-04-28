const config = require('../Config/config');
const { createAuthLimiter } = require('../Middlewares/setup');

const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const productRoutes = require('./product');
const categoryRoutes = require('./category');

const setupRoutes = (app) => {
    const authLimiter = createAuthLimiter();
    const shouldUseAuthLimiter = config.NODE_ENV === 'production';

    app.use('/api/auth', shouldUseAuthLimiter ? authLimiter : [], authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoryRoutes);
};

module.exports = {
    setupRoutes
};
