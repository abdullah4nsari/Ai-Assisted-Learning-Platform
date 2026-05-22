import axios from 'axios';
import { BASE_URL } from './apiPaths.js';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30s default — covers Render cold starts
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// request interceptor — attach JWT
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;

        // Auth endpoints (register/login) get extra time for email sending + cold starts
        if (config.url?.startsWith('/api/auth')) {
            config.timeout = 60000; // 60s for auth routes
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthEndpoint = error.config?.url?.startsWith('/api/auth');

        if (error.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (error.response?.status === 500) {
            console.error('Server Error:', error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout. Please try again.');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
