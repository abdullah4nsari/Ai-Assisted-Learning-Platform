import axiosInstance from "../util/axiosInstance";
import { API_PATHS } from "../util/apiPaths";

const getDocuments = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to fetch documents!'};
    }
};

const uploadDocuments = async (FormData)=>{
    try{
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD_DOCUMENT,FormData ,{
            headers:{
                "Content-Type":"multipart/form-data"
            }
        });
        return response.data;
    }catch(error){
        throw error.response?.data || {message:'Failed to upload document!'};
    }
}

const deleteDocument = async (documentId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to delete document!'};
    }
};

const getDocumentById = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to fetch document!'};
    }
};

const documentService = {
    getDocuments,
    uploadDocuments,
    deleteDocument,
    getDocumentById
}

export default documentService;