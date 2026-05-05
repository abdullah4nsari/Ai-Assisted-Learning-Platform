import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPdf } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import { cloudinary } from '../config/multer.js';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";

//@desc upload pdf document
//@route POST /api/documents/upload
//@access private
export const uploadDocument = async (req, res, next) => {
  try {
    console.log("🚀 uploadDocument API HIT");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a file",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    console.log("FILE DEBUG:", req.file);

    // ✅ Upload to Cloudinary manually
    const result = await uploadToCloudinary(req.file);

    const document = await Document.create({
      userId: req.user._id,
      title,
      filename: req.file.originalname,
      filepath: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      filesize: result.bytes,
      status: "processing",
    });

    // ✅ Only process if it's a PDF — pass buffer directly, no re-download needed
    if (req.file.mimetype === "application/pdf") {
      processPDF(document._id, req.file.buffer).catch((err) => {
        console.error("PDF processing error:", err);
      });
    }

    res.status(201).json({
      success: true,
      data: document,
      message: "File uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    next(error);
  }
};


// helper — parses PDF from buffer and updates document
const processPDF = async (documentId, buffer) => {
    try {
        const { text } = await extractTextFromPdf(buffer);
        const chunks = chunkText(text);

        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);
        await Document.findByIdAndUpdate(documentId, { status: 'failed' });
    }
};


//@desc get all user documents
//@route GET /api/documents/
//@access private
export const getDocuments = async (req, res, next) => {
    try {
        const Documents = await Document.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            { $sort: { uploadDate: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: Documents.length,
            data: Documents
        });
    } catch (error) {
        next(error);
    }
};


//@desc proxy-stream PDF from Cloudinary so browser renders inline
//@route GET /api/documents/:id/preview-url
//@access private
export const getPreviewUrl = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        const filepath = document.filepath;

        // Local file (old uploads before Cloudinary)
        if (filepath.startsWith('http://localhost') || filepath.startsWith('http://127.0.0.1')) {
            const localPath = filepath.replace(/^https?:\/\/[^/]+/, '');
            const absolutePath = path.join(process.cwd(), localPath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
            return res.sendFile(absolutePath);
        }

        // Cloudinary or remote URL — proxy stream
        const response = await axios.get(filepath, { responseType: 'stream' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
        response.data.pipe(res);
    } catch (error) {
        next(error);
    }
};

//@desc get a single document with chunks
//@route GET /api/documents/:id
//@access private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id });

        document.lastAccessed = Date.now();
        await document.save();

        res.status(200).json({
            success: true,
            data: { ...document.toObject(), flashcardCount, quizCount }
        });
    } catch (error) {
        next(error);
    }
};


//@desc delete a document
//@route DELETE /api/documents/:id
//@access private
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Delete from Cloudinary if public_id exists
        if (document.public_id) {
            try {
                const result = await cloudinary.uploader.destroy(document.public_id, {
                    resource_type: document.resource_type || 'raw'
                });
                console.log(`Cloudinary delete result for ${document.public_id}:`, result);
            } catch (e) {
                console.error('Cloudinary delete error:', e.message);
            }
        }

        // Delete local file if filepath points to localhost
        if (document.filepath?.startsWith('http://localhost') || document.filepath?.startsWith('http://127.0.0.1')) {
            try {
                const localPath = document.filepath.replace(/^https?:\/\/[^/]+/, '');
                const absolutePath = path.join(process.cwd(), localPath);
                await fs.unlink(absolutePath);
                console.log(`Local file deleted: ${absolutePath}`);
            } catch (e) {
                console.error('Local file delete error:', e.message);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
