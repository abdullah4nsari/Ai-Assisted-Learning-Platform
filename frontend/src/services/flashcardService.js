import axiosInstance from "../util/axiosInstance";
import { API_PATHS } from "../util/apiPaths";

const getFlashcardSets = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCARDS_SETS);
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to fetch flashcards!'};
    }
};

const getFLashcardsForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId));
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to fetch flashcards for document!'};
    }
}

const reviewFlashcard = async (cardId, isKnown) => {
    try {
        const response = await axiosInstance.post(API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId), {isKnown});
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to review flashcard!'};
    }
};

const toggleStarFlashcard = async (cardId) => {
    try {
        const response = await axiosInstance.put(API_PATHS.FLASHCARDS.TOGGLE_STAR_FLASHCARD(cardId));
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to star flashcard!'};
    }
};

const deleteFlashcardSet = async (setId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(setId));
        return response.data;
    } catch (error) {
        throw error.response?.data || {message:'Failed to delete flashcard set!'};
    }
};

const flashcardService = {
    getFlashcardSets,
    getFLashcardsForDocument,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet
}

export default flashcardService;