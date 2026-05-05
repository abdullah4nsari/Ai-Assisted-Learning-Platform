import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import {extractTextFromPdf} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';


//@desc upload pdf document
//@route POST /api/documents/upload
//@access private
export const uploadDocument = async (req , res, next)=>{
    try {
        if(!req.file){
            return res.status(400).json({
                success:false,
                error:'Please upload a pdf file',
                statusCode:400
            })
        }
        
        const {title}=req.body;
        if(!title){
            //delete uploaded file if not title provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success:false,
                error:'Please provide a document title',
                statusCode:400
            })
        }
        
        //construct the url for the uploaded file
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        //create document record 
        const document = await Document.create({
            userId: req.user._id,
            title,
            filename: req.file.originalname,
            filepath: fileUrl, //store the url instead of the local path
            filesize: req.file.size,
            status: 'processing'
        });
        console.log('i am here');
        //process pdf in background (in production, use a queue like bull)
        processPDF(document._id, req.file.path).catch(err=>{
            console.error('PDF processing error:', err);
        });

        res.status(201).json({
            success:true,
            data: document,
            message: 'Document uploaded successfully. Processing in progress...'
        })
    } catch (error) {
        //clean up file on error
        if(req.file){
            await fs.unlink(req.file.path).catch(()=>{})
        }
        next(error);
    }
}

//helper function to process PDF
const processPDF = async (documentId, filePath)=>{
    try {
        const {text} = await extractTextFromPdf(filePath);

        //create chunks
        const chunks= chunkText(text);

        //update document
        await Document.findByIdAndUpdate(documentId,{
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);

    } catch (error) {
        console.error(`Error processing document ${documentId}:`,error);
        await Document.findByIdAndUpdate(documentId, {status: 'failed'});
    }
}



//@desc get all user document
//@route GET /api/documents/
//@access private
export const getDocuments = async (req , res, next)=>{
    try {
        const Documents = await Document.aggregate([
            {
                $match:{userId:new mongoose.Types.ObjectId(req.user._id)}
            },
            {
                $lookup:{
                    from : 'flashcards',
                    localField:'_id',
                    foreignField:'documentId',
                    as:'flashcardSets'
                }
            },
            {
                $lookup:{
                    from : 'quizzes',
                    localField:'_id',
                    foreignField:'documentId',
                    as:'quizzes'
                }
            },
            {
                $addFields:{
                    flashcardCount:{$size:'$flashcardSets'},
                    quizCount:{$size:'$quizzes'}
                }
            },
            {
                $project:{
                    extractedText:0,
                    chunks:0,
                    flashcardSets:0,
                    quizzes:0
                }
            },
            {
                $sort:{uploadDate:-1}
            }
        ]);
        res.status(200).json({
            success:true,
            count:Documents.length,
            data:Documents
        });
    } catch (error) {
        next(error);
    }
}
//@desc get a single with chunks
//@route GET /api/documents/:id
//@access private
export const getDocument = async (req , res, next)=>{
    try {
        const document=await Document.findOne({
            _id:req.params.id,
            userId:req.user._id
        })
        if(!document){
            return res.status(404).json({
                success:false,
                error:'Document not found',
                statusCode:404
            })
        }   
        // get count of associated flashcards and quizes
        const flashcardCount=await Flashcard.countDocuments({documentId:document._id,userId:req.user._id});
        const quizCount=await Quiz.countDocuments({documentId:document._id, userId:req.user._id});

        //update last accessed
        document.lastAccessed = Date.now();
        await document.save();

        //combine document data with counts
        const documentData = {
            ...document.toObject(),
            flashcardCount,
            quizCount
        };

        res.status(200).json({
            success:true,
            data:documentData
        });
    } catch (error) {
        next(error);
    }
}
//@desc delete a document
//@route DELETE /api/documents/:id
//@access private
export const deleteDocument = async (req , res, next)=>{
    try {
        const document=await Document.findOneAndDelete({
            _id:req.params.id,
            userId:req.user._id
        });

        if(!document){
            return res.status(404).json({
                success:false,
                error:'Document not found',
                statusCode:404
            })
        }

        //delete file from filesystem
        await fs.unlink(document.filepath).catch(()=>{});

        //delete document
        await document.deleteOne();

        res.status(200).json({
            success:true,
            message:'Document deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

