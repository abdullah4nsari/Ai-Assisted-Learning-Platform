import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from '../models/ChatHistory.js';
import Flashcard from "../models/Flashcard.js";
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from "../utils/textChunker.js";
import { parse } from "dotenv";
import { ExplainableCursor } from "mongodb";

//@desc generate flashcard from documents
//@route POST /api/ai/generate-flashcards
//@access private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Document ID is required, please provide documentId',
                statusCode: 400
            })
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not processed yet',
                statusCode: 404
            })
        }

        //generate flashcards using gemini
        const cards = await geminiService.generateFlashcards(document.extractedText, parseInt(count));

        //save to database
        const flashcardset = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
        });

        res.status(200).json({
            success: true,
            data: flashcardset,
            message: 'Flashcards generated successfully'
        });

    } catch (error) {
        next();
    }
}


//@desc generate quiz from documents
//@route POST /api/ai/generate-quiz
//@access private
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestion = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Document ID is required, please provide documentId',
                statusCode: 400
            })
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            res.status(404).json({
                success: false,
                error: 'Document not found or not processed yet',
                statusCode: 404
            })
        }

        //generate quiz using gemini
        const questions = await geminiService.generateQuiz(document.extractedText, parseInt(numQuestion));


        //save to database
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswer: [],
            score: 0
        });

        res.status(200).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully'
        });
    } catch (error) {
        next();
    }
}


//@desc generate document summary
//@route POST /api/ai/generate-summary
//@access private
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            res.status(400).json({
                success: false,
                error: 'Document ID is required, please provide documentId',
                statusCode: 400
            })
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            res.status(404).json({
                success: false,
                error: 'Document not found or not processed yet',
                statusCode: 404
            })
        }

        const summary = await geminiService.generateSummary(document.extractedText);

        res.status(200).json({
            success: true,
            data: {
                summary,
                documentId: document._id,
                title: document.title
            },
            message: 'Summary generated successfully'
        });
    } catch (error) {
        next();
    }
}



//@desc chat with document
//@route POST /api/ai/chat
//@access private
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Document ID and question are required',
                statusCode: 400
            })
        }
        
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });
        
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not processed yet',
                statusCode: 404
            })
        }
      
        //find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);
        console.log(relevantChunks);
        //Get or create chat history 
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        }) || new ChatHistory({
            userId: req.user._id,
            documentId: document._id,
            messages: []
        });

        
        //generate response using gemini
        const answer = await geminiService.chatWithContext(question, relevantChunks);
        chatHistory.messages.push({
            role: 'user',
            content: question,
            timestamp: new Date(),
            relevantChunks: []
        }, {
            role: 'assistant',
            content: answer,
            timestamp: new Date(),
            relevantChunks: chunkIndices
        }
        );

        console.log('relevantChunks:', answer);
        console.log('chat History', chatHistory);
        //save
        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Chat response generated successfully'
        })
    } catch (error) {
        next();
    }
}


//@desc Explain concept from document
//@route POST /api/ai/explain-concept
//@access private
export const explainConcept = async (req, res, next) => {
    try {
        const {documentId,concept}=req.body;
        if(!documentId || !concept){
            return res.status(400).json({
                success:false,
                error:'Document ID and concept are required',
                statusCode:400
            });
        }

        const document = await Document.findOne({
            _id:documentId,
            userId:req.user._id,
            status:'ready'
        });

        
        if(!document){
            return res.status(404).json({
                success:false,
                error:'Document not found or not processed yet',
                statusCode:404
            });
        }

        //find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks,concept,3);

        console.log('relevant chunks:',relevantChunks);
        // const context = relevantChunks.map(chunk => chunk.content).join('\n\n');
        const explanation = await geminiService.explainConcept(concept, relevantChunks);
        console.log(explanation);

        res.status(200).json({
            success:true,
            data:{
                concept,
                explanation,
                documentId:document._id,
                relevantChunks:relevantChunks.map(c=>c.chunkIndex)
            },
            message:'Explanation generated successfully'
        });
    } catch (error) {
        console.log(error);
        next();
    }
}


//@desc get chat history for a document
//@route GET /api/ai/chat-history/:documentId
//@access private
export const getChatHistory = async (req, res, next) => {
    try {
        const {documentId} = req.params;
        if(!documentId){
            return res.status(400).json({
                success:false,
                error:'Document ID is required',
                statusCode:400
            });
        }

        const chatHistory = await ChatHistory.findOne({
            userId:req.user._id,
            documentId:documentId
        }).select('messages');

        if(!chatHistory){
            return res.status(404).json({
                success:false,
                error:'Chat history not found',
                statusCode:404
            });
        }

        res.status(200).json({
            success:true,
            data:chatHistory,
            message:'Chat history retrieved successfully'
        });

    } catch (error) {
        next();
    }
}