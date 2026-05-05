import axiosInstance from "../util/axiosInstance";
import { API_PATHS } from "../util/apiPaths";

const login = async (email,password) => {
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
            email,
            password
        });
        return response.data;
    } catch(error){
        throw error.response?.data || error.message;
    }
}

const register = async (username,email,password) => {
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER,{
            username,
            email,
            password
        });
        return response.data;
    } catch(error){
        throw error.response?.data || error.message;
    }
}

const getProfile = async () => {
    try{
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data;
    } catch(error){
        throw error.response?.data || error.message;
    }
}

const updateProfile = async (username,email,profileImage) => {
    try{
        const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
            username,
            email,
            profileImage
        });
        return response.data;
    } catch(error){
        throw error.response?.data || error.message;
    }
}

const changePassword = async (currentPassword, newPassword) => {
    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD,{
            currentPassword,
            newPassword
        });
        return response.data;
    } catch(error){
        throw error.response?.data || error.message;
    }
}

const authService = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword
};

export default authService;