import express from 'express';
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    getPreviewUrl
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

//all routes are protected 
router.use(protect);

// router.post('/upload', upload.single('file'),uploadDocument);
router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
      if (err) {
        console.error("🔥 RAW ERROR OBJECT:", err);
        console.error("🔥 TYPE:", typeof err);
        console.error("🔥 KEYS:", Object.keys(err || {}));
        console.log("CLOUDINARY ENV CHECK:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "present" : "missing",
});

        return res.status(400).json({
          success: false,
          error: err?.message || err || "Unknown multer error",
        });
      }
      next();
    });
  },
  uploadDocument
);
router.get('/',getDocuments);
router.get('/:id/preview-url', getPreviewUrl);
router.get('/:id',getDocument);
router.delete('/:id',deleteDocument);

export default router;