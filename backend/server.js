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
        EMAIL_PASSWORD_LEN: (process.env.EMAIL_PASSWORD || '').trim().length,
        CLIENT_URL:         process.env.CLIENT_URL || 'NOT SET',
        NODE_ENV:           process.env.NODE_ENV,
    });
});

// Test email route — sends a real test email and returns exact error if it fails
app.post('/api/health/test-email', async (req, res) => {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: 'Provide { to: "email" } in body' });
    try {
        const { sendVerificationEmail } = await import('./utils/emailService.js');
        await sendVerificationEmail(to, 'TestUser', 'test-token-123');
        res.json({ success: true, message: `Email sent to ${to}` });
    } catch (e) {
        res.status(500).json({
            success: false,
            error: e.message,
            EMAIL_USER_SET:     !!process.env.EMAIL_USER,
            EMAIL_PASSWORD_LEN: (process.env.EMAIL_PASSWORD || '').trim().length,
        });
    }
});

// Port connectivity test — checks which outbound ports Render allows
app.get('/api/health/ports', async (req, res) => {
    const net = await import('net');
    const tests = [
        { host: 'smtp.gmail.com', port: 587 },
        { host: 'smtp.gmail.com', port: 465 },
        { host: 'smtp.gmail.com', port: 25  },
        { host: 'api.resend.com', port: 443 },
    ];
    const results = await Promise.all(tests.map(({ host, port }) =>
        new Promise(resolve => {
            const sock = new net.default.Socket();
            sock.setTimeout(5000);
            sock.connect(port, host, () => { sock.destroy(); resolve({ host, port, open: true }); });
            sock.on('error',   () => { sock.destroy(); resolve({ host, port, open: false, reason: 'error' }); });
            sock.on('timeout', () => { sock.destroy(); resolve({ host, port, open: false, reason: 'timeout' }); });
        })
    ));
    res.json(results);
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
