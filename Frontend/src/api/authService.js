import axiosInstance from './axiosInstance';

const authService = {
    register: async (userData) => {
        try {
            return await axiosInstance.post('/api/auth/register', userData);
        } catch (error) {
            throw error;
        }
    },
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post('/api/auth/login', credentials);
            // Save token and role to localStorage
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.user?.role || 'user');
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    adminLogin: async (credentials) => {
        try {
            const response = await axiosInstance.post('/api/admin/login', credentials);
            // Save token and role to localStorage
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.admin?.role || 'admin');
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    verifyEmail: async (verificationData) => {
        try {
            const response = await axiosInstance.post('/api/auth/verify', verificationData);
            // Save token and role if returned for auto-login
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.user?.role || 'user');
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    resendOTP: async (userId) => {
        try {
            return await axiosInstance.post('/api/auth/resend', { userId });
        } catch (error) {
            throw error;
        }
    },

    forgotPassword: async (data) => {
        try {
            return await axiosInstance.post('/api/auth/forgot-password', data);
        } catch (error) {
            throw error;
        }
    },

    verifyResetOTP: async (data) => {
        try {
            return await axiosInstance.post('/api/auth/verify-reset-otp', data);
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (data) => {
        try {
            return await axiosInstance.post('/api/auth/reset-password', data);
        } catch (error) {
            throw error;
        }
    },
    logout: async () => {
        try {
            const response = await axiosInstance.post('/api/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            return response;
        } catch (error) {
            throw error;
        }
    },

    getProfile: async () => {
        try {
            return await axiosInstance.get('/api/auth/get-profile');
        } catch (error) {
            throw error;
        }
    },
    updateProfile: async (updateData) => {
        try {
            return await axiosInstance.put('/api/auth/profile', updateData);
        } catch (error) {
            throw error;
        }
    },
    changePassword: async (data) => {
        try {
            return await axiosInstance.put('/api/auth/change-password', data);
        } catch (error) {
            throw error;
        }
    }
};

export default authService;
