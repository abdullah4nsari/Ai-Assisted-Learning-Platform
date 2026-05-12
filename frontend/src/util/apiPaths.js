
export const BASE_URL = 'https://ai-assisted-learning-platform.onrender.com';

export const API_PATHS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        GOOGLE_AUTH: '/api/auth/google',
        VERIFY_EMAIL: (token) => `/api/auth/verify-email/${token}`,
        RESEND_VERIFICATION: '/api/auth/resend-verification',
        GET_PROFILE: '/api/auth/profile',
        UPDATE_PROFILE: '/api/auth/profile',
        CHANGE_PASSWORD: '/api/auth/change-password'
    },
    DOCUMENTS: {
        UPLOAD_DOCUMENT: '/api/documents/upload',
        GET_DOCUMENTS: '/api/documents',
        GET_DOCUMENT_BY_ID: (id) => `/api/documents/${id}`,
        GET_PREVIEW_URL: (id) => `/api/documents/${id}/preview-url`,
        UPDATE_DOCUMENT : (id) => `/api/documents/${id}`,
        DELETE_DOCUMENT: (id) => `/api/documents/${id}`
    },
    AI:{
        GENERATE_FLASHCARDS: '/api/ai/generate-flashcards',
        GENERATE_QUIZ: '/api/ai/generate-quiz',
        GENERATE_SUMMARY: '/api/ai/generate-summary',
        CHAT:'/api/ai/chat',
        EXPLAIN_CONCEPT:'/api/ai/explain-concept',
        GET_CHAT_HISTORY:(id) => `/api/ai/chat-history/${id}`
    },
    FLASHCARDS:{
        GET_ALL_FLASHCARDS_SETS: '/api/flashcards/',
        GET_FLASHCARDS_FOR_DOC:(id)=>`/api/flashcards/${id}`,
        REVIEW_FLASHCARD:(cardId)=>`/api/${cardId}/review`,
        TOGGLE_STAR_FLASHCARD:(cardId)=>`/api/flashcards/${cardId}/star`,
        DELETE_FLASHCARD_SET:(setId)=>`/api/flashcards/${setId}`
    },
    QUIZZES:{
        GET_QUIZ_FOR_DOC: (documentId)=>`/api/quizzes/${documentId}`,
        GET_QUIZ_BY_ID:(quizId)=>`/api/quizzes/quiz/${quizId}`,
        SUBMIT_QUIZ:(quizId)=>`/api/quizzes/${quizId}/submit`,
        GET_QUIZ_RESULTS:(quizId)=>`/api/quizzes/${quizId}/results`,
        DELETE_QUIZ:(quizId)=>`/api/quizzes/${quizId}`
    },
    PROGRESS:{
        GET_DASHBOARD:'/api/progress/dashboard'
    }
}