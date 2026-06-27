const express = require('express');
const {
	adminLogin,
	adminLogout,
	getAllUsers,
	getUserById,
	updateUserStatus,
	banUser,
	unbanUser,
	forceLogoutUser,
	updateUser,
	deleteUser,
	getDashboardStats
} = require('../Controllers/AuthController');
const { getAllOrders, updateOrderStatus, approveReturn, rejectReturn, getReturnRequests } = require('../Controllers/orderController');
const { verifyAdminToken } = require('../Middlewares/auth');
const { loginLimiter } = require('../Middlewares/setup');
const { validateLogin } = require('../Middlewares/validation');
 
const router = express.Router();
 
router.post('/login', loginLimiter, validateLogin, adminLogin);
router.post('/logout', verifyAdminToken, adminLogout);
router.get('/users', verifyAdminToken, getAllUsers);
router.get('/users/:id', verifyAdminToken, getUserById);
router.put('/users/:id', verifyAdminToken, updateUser);
router.delete('/users/:id', verifyAdminToken, deleteUser);
router.post('/users/:id/ban', verifyAdminToken, banUser);
router.post('/users/:id/unban', verifyAdminToken, unbanUser);
router.post('/users/:id/force-logout', verifyAdminToken, forceLogoutUser);
router.patch('/user/:id/status', verifyAdminToken, updateUserStatus);
router.get('/stats', verifyAdminToken, getDashboardStats);

// Order Management
router.get('/orders', verifyAdminToken, getAllOrders);
router.get('/returns', verifyAdminToken, getReturnRequests);
router.patch('/orders/:orderId/status', verifyAdminToken, updateOrderStatus);
router.post('/returns/:returnId/approve-return', verifyAdminToken, approveReturn);
router.post('/returns/:returnId/reject-return', verifyAdminToken, rejectReturn);

module.exports = router;