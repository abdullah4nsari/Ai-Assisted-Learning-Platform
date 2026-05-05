import axios from 'axios';
import {BASE_URL} from './apiPaths.js';

const axiosInstance = axios.create({
    baseUrl: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

//request interceptor
axiosInstance.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)


//response interceptor
axiosInstance.interceptors.response.use(
    (response)=> response,
    (error)=>{
        if(error.response?.status === 401){
            localStorage.removeItem('token');
            window.location.href='/login';
        } else if (error.response?.status === 500){
            console.error('Server Error:', error.response.data);
        } else if (error.code === 'ECONNABORTED'){
            console.error('Request timeout. Please try again.');
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;