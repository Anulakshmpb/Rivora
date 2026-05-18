import axiosInstance from './axiosInstance';

const adminService = {
    getAllOrders: async () => {
        try {
            const response = await axiosInstance.get('/api/admin/orders');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getUsers: async () => {
        try {
            const response = await axiosInstance.get('/api/admin/users');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getProducts: async () => {
        try {
            const response = await axiosInstance.get('/api/products');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getCoupons: async () => {
        try {
            const response = await axiosInstance.get('/api/coupons');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await axiosInstance.patch(`/api/admin/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getReturns: async () => {
        try {
            const response = await axiosInstance.get('/api/admin/returns');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    approveReturn: async (returnId) => {
        try {
            const response = await axiosInstance.post(`/api/admin/returns/${returnId}/approve-return`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    rejectReturn: async (returnId, reason) => {
        try {
            const response = await axiosInstance.post(`/api/admin/returns/${returnId}/reject-return`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getStats: async () => {
        try {
            const response = await axiosInstance.get('/api/admin/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getMessages: async () => {
        try {
            const response = await axiosInstance.get('/api/messages');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    markMessageAsRead: async (messageId) => {
        try {
            const response = await axiosInstance.patch(`/api/messages/${messageId}/read`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    replyMessage: async (messageId, replyText) => {
        try {
            const response = await axiosInstance.post(`/api/messages/${messageId}/reply`, { replyText });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default adminService;
