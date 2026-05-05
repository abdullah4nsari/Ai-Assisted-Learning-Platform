import axiosInstance from "../util/axiosInstance";
import { API_PATHS } from "../util/apiPaths";

const generateFlashcards = async (documentId, count=10) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, {
            documentId,
            count
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to generate Flashcards!'};
    }
};


const generateQuiz = async (documentId, numQuestion=5, title='Untitled') => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, {
            documentId,
            numQuestion,
            title
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to generate quiz!'};
    }
};

const generateSummary = async (documentId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, {
            documentId
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to generate summary!'};
    }
};


const chat = async (message, documentId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
            question: message,
            documentId
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Chat request failed!'};
    }
};

const explainConcept = async (documentId, concept) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
            documentId,
            concept
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to explain concept!'};
    }
};

const getChatHistory = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to fetch chat history!'};
    }
}

const aiService = {
    generateFlashcards,

    generateQuiz,

    generateSummary,

    chat,

    explainConcept,

    getChatHistory

}

export default aiService;