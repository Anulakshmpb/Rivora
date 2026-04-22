import axiosInstance from './axiosInstance';

const authService = {
    /**
     * Register a new user
     * @param {Object} userData { name, email, password }
     */
    register: async (userData) => {
        try {
            return await axiosInstance.post('/api/auth/register', userData);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Login user
     * @param {Object} credentials { email, password }
     */
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

    /**
     * Login Admin
     * @param {Object} credentials { email, password }
     */
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

    /**
     * Verify OTP
     * @param {Object} data { userId, otp }
     */
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

    /**
     * Resend OTP
     * @param {string} userId
     */
    resendOTP: async (userId) => {
        try {
            return await axiosInstance.post('/api/auth/resend', { userId });
        } catch (error) {
            throw error;
        }
    },

    /**
     * Request Forgot Password OTP
     * @param {Object} data { email }
     */
    forgotPassword: async (data) => {
        try {
            return await axiosInstance.post('/api/auth/forgot-password', data);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Verify Password Reset OTP
     * @param {Object} data { userId, otp }
     */
    verifyResetOTP: async (data) => {
        try {
            return await axiosInstance.post('/api/auth/verify-reset-otp', data);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Reset Password with token
     * @param {Object} data { userId, resetToken, newPassword }
     */
    resetPassword: async (data) => {
        try {
            return await axiosInstance.post('/api/auth/reset-password', data);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Logout user
     */
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

    /**
     * Get user profile
     */
    getProfile: async () => {
        try {
            return await axiosInstance.get('/api/auth/get-profile');
        } catch (error) {
            throw error;
        }
    }
};

export default authService;
