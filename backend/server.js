import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from'./routes/documentRoutes.js';
import flascardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';


//ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//initialize express app
const app = express();

//connect to db
connectDB();

//middleware
app.use(cors({
    origin:'*',
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders:['Content-Type','Authorization'],
    credentials:true,
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));


//static folder for uploads
app.use('/uploads',express.static(path.join(__dirname,'uploads')));


//routes
app.use('/api/auth',authRoutes);
app.use('/api/documents',documentRoutes);
app.use('/api/flashcards', flascardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes',quizRoutes);
app.use('/api/progress',progressRoutes);

// Diagnostic route — check if email env vars are configured on the server
app.get('/api/health/email', (req, res) => {
    res.json({
        RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY,
        CLIENT_URL:         process.env.CLIENT_URL || 'NOT SET',
        NODE_ENV:           process.env.NODE_ENV,
    });
});

// Test email route — sends a real test email to diagnose issues on deployed server
app.post('/api/health/test-email', async (req, res) => {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: 'Provide { to: "email" } in body' });
    try {
        const { sendVerificationEmail } = await import('./utils/emailService.js');
        await sendVerificationEmail(to, 'TestUser', 'test-token-123');
        res.json({ success: true, message: `Test email sent to ${to}` });
    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.message,
            RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY,
        });
    }
});


app.use(errorHandler);

//404 handler
app.use((req,res)=>{
    res.status(404).json({  
        success:false,
        error:'Route not found',
        statusCode:404
    });
});


//start server
const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`Server running in ${process.env.NODE_ENV} mode on PORT ${PORT}`);
});

process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>{
        process.exit(1);
    });
} )
