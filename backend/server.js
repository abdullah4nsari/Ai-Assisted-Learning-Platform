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
        EMAIL_USER_SET:     !!process.env.EMAIL_USER,
        EMAIL_PASSWORD_SET: !!process.env.EMAIL_PASSWORD,
        CLIENT_URL:         process.env.CLIENT_URL || 'NOT SET',
        NODE_ENV:           process.env.NODE_ENV,
    });
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
