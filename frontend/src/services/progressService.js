import axiosInstance from "../util/axiosInstance";
import { API_PATHS } from "../util/apiPaths";

const getDashboardData = async ()=>{
    try{
        const response = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);
        return response.data;
    }catch(error){
        throw error.response?.data || {message:'Failed to fetch dashboard data!'};
    }
}

const progressService = {
    getDashboardData
}

export default progressService;