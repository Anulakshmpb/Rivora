import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Optional (can be used for other headers if needed)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('auth-error'));
            // We don't redirect here to avoid breaking guest checkout flow
        }
        const errorData = error.response?.data || { message: 'Something went wrong' };
        
        return Promise.reject(errorData);
    }
);

export default axiosInstance;
