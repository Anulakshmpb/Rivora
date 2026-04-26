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
        
        return Promise.reject(errorData);
    }
);

export default axiosInstance;
