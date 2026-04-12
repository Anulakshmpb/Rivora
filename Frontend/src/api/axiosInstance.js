import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Auth Token if available
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
        const errorData = error.response?.data || { message: 'Something went wrong' };
        
        // Handle unauthorized (401)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        }
        
        return Promise.reject(errorData);
    }
);

export default axiosInstance;
