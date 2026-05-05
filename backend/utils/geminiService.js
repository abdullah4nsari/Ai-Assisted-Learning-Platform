import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
}

/**
 * generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - number of flashcards to generate
 * @returns {Promise<Array<{question:string,answer: string, difficulty:string}>>} - array of flashcards
 */

export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate exactly ${count} educational flascards from the following text.
    Format each flashcard as:
    Q: [clear, specific question]
    A: [consice, accurate answer]
    D: [Difficulty level: easy, medium, hard]

    seperate each flashcard with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ]
        });

        const generateText = response.text;

        //parse the response
        const flashcards = [];
        const cards = generateText.split('---').filter(c => c.trim());

        for (const card of cards) {
            const lines = card.split('\n');
            let question = '', answer = '', difficulty = 'medium',diff;

            for (const line of lines) {
                if (line.startsWith('Q:')) {
                    question = line.substring(2).trim();
                } else if (line.startsWith('A:')) {
                    answer = line.substring(2).trim();
                } else if (line.startsWith('D:')) {
                    diff = line.substring(2).trim();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }

        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate flashcards');
    }
};



/**
 * Generate Quiz Questions
 * @param {string} text - Document text
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array<{question:string, options:Array<string>, correctAnswer:string, explanation:string, difficulty:string}>>}
 */

export const generateQuiz = async (text, count) => {
    const prompt = `Generate exactly ${count} multiple choice quiz questions from the following text.
    Format each question as:
    Q: [clear question]
    O1: [option 1]
    O2: [option 2]
    O3: [option 3]
    O4: [option 4]
    C: [correct option - exactly as written above]
    E: [brief explanation]
    D: [difficulty: easy, medium, hard]

    Separate each question with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ]
        });

        const generatedText = response.text;
        const questions = [];
        const qs = generatedText.split('---').filter(q => q.trim());

        for (const q of qs) {
            const lines = q.split('\n');
            let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.match(/^O\d:/)) {
                    options.push(trimmed.substring(3).trim());
                } else if (trimmed.startsWith('C:')) {
                    correctAnswer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('E:')) {
                    explanation = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && options.length === 4 && correctAnswer && explanation) {
                questions.push({ question, options, correctAnswer, explanation, difficulty });
            }
        }
        return questions.slice(0, count);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate quiz questions');
    }


};
/**
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */

export const generateSummary = async (text) => {
    const prompt = `Provide the consice summary of the following text, highlighting the key concepts, main ideas, and important point
    keep the summary clear and structured.
    
    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ]
        });

        return response.text;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate summary');
    }

}

/**
 * chat with document context
 * @param {string} message - user question
 * @param {Array<Object>} context - relevent document chunks
 * @returns {Promise<string>}
 */


export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((chunk, index) => `Chunk ${index + 1}: ${chunk.content}`).join('\n\n');

    const prompt = `Based on the following context from a document, Analyze the context and answer the user's question.
    If the answer is not in the context, say so.
    
    Context:
    ${context}
    
    Question: ${question}
    
    Answer:`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ]
        });

        return response.text;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to process chat request');
    }
}

/**
 * explain a specific concept from the document
 * @param {string} concept - the concept to explain
 * @param {Array<Object>} chunks - relevant document chunks
 * @returns {Promise<string>}
 */

export const explainConcept = async (concept, chunks) => {
    const context = chunks.map((chunk, index) => `Chunk ${index + 1}: ${chunk.content}`).join('\n\n');

    const prompt = `Explain the concept of "${concept}" based on the following document context.
    Provide a clear, educational explanation that helps understand the concept easily.
    Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ]
        });

        return response.text;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to explain concept');
    }
}