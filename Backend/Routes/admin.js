const express = require('express');
const {
	adminLogin,
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
const { authenticateAdmin } = require('../Middlewares/auth');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/users', authenticateAdmin, getAllUsers);
router.get('/users/:id', authenticateAdmin, getUserById);
router.put('/users/:id', authenticateAdmin, updateUser);
router.delete('/users/:id', authenticateAdmin, deleteUser);
router.post('/users/:id/ban', authenticateAdmin, banUser);
router.post('/users/:id/unban', authenticateAdmin, unbanUser);
router.post('/users/:id/force-logout', authenticateAdmin, forceLogoutUser);
router.patch('/user/:id/status', authenticateAdmin, updateUserStatus);
router.get('/stats', authenticateAdmin, getDashboardStats);

// Order Management
router.get('/orders', authenticateAdmin, getAllOrders);
router.get('/returns', authenticateAdmin, getReturnRequests);
router.patch('/orders/:orderId/status', authenticateAdmin, updateOrderStatus);
router.post('/orders/:orderId/approve-return', authenticateAdmin, approveReturn);
router.post('/orders/:orderId/reject-return', authenticateAdmin, rejectReturn);

module.exports = router;