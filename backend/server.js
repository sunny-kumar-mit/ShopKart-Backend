const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first'); // CRITICAL FIX: Force Node to use IPv4 for Gmail
require('dotenv').config();
require('./config/passport'); // Init passport

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['https://shopkartindia.vercel.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/auth', require('./routes/auth')); // For Google Auth Callback compatibility
app.use('/api/addresses', require('./routes/address'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/user', require('./routes/user'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// TEMPORARY DEBUG ROUTE
app.get('/api/debug-email', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Please provide email query param' });

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ShopKart Debug Email',
            text: 'If you see this, your email configuration is CORRECT!'
        });
        res.json({
            success: true,
            message: 'Email sent successfully!',
            info: info.response,
            env: {
                userConfigured: !!process.env.EMAIL_USER,
                passConfigured: !!process.env.EMAIL_PASS
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            env: {
                userConfigured: !!process.env.EMAIL_USER,
                passConfigured: !!process.env.EMAIL_PASS
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
