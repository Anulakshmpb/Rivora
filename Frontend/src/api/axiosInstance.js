import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://13.238.159.254:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Optional (can be used for other headers if needed)
axiosInstance.interceptors.request.use(
    (config) => {
        const adminToken = localStorage.getItem('admin_token');
        const userToken = localStorage.getItem('user_token');
        const legacyToken = localStorage.getItem('token');
        
        let token = null;

        // 1. If the API request is specifically for an admin route or messages, send admin token
        if (config.url && (
            config.url.startsWith('/api/admin') || config.url.startsWith('api/admin') ||
            config.url.startsWith('/api/messages') || config.url.startsWith('api/messages')
        )) {
            token = adminToken;
        }
        // 2. If the API request is specifically for user routes, send user token
        else if (config.url && (
            config.url.startsWith('/api/cart') || config.url.startsWith('api/cart') ||
            config.url.startsWith('/api/orders') || config.url.startsWith('api/orders') ||
            config.url.startsWith('/api/wallet') || config.url.startsWith('api/wallet')
        )) {
            token = userToken;
        }
        // 3. Fallback based on the current page route
        else {
            const isAdminPath = window.location.pathname.startsWith('/admin');
            token = isAdminPath ? (adminToken || legacyToken) : (userToken || legacyToken);
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle global errors
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            const isAdminPath = window.location.pathname.startsWith('/admin') || 
                                (error.config?.url && (
                                    error.config.url.startsWith('/api/admin') || error.config.url.startsWith('api/admin') ||
                                    error.config.url.startsWith('/api/messages') || error.config.url.startsWith('api/messages')
                                ));

            localStorage.removeItem('token'); // clear legacy
            if (isAdminPath) {
                localStorage.removeItem('admin_token');
                window.dispatchEvent(new CustomEvent('admin-auth-error'));
            } else {
                localStorage.removeItem('user_token');
                window.dispatchEvent(new CustomEvent('user-auth-error'));
            }
        }
        const errorData = error.response?.data || { message: 'Something went wrong' };
        
        return Promise.reject(errorData);
    }
);

export default axiosInstance;
