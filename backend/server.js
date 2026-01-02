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

    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const data = await resend.emails.send({
            from: 'ShopKart <onboarding@resend.dev>',
            to: email,
            subject: 'ShopKart Debug Email (Resend)',
            html: '<strong>If you see this, Resend is working perfectly!</strong>'
        });

        if (data.error) {
            throw new Error(data.error.message);
        }

        res.json({
            success: true,
            message: 'Email sent successfully via Resend API!',
            id: data.id,
            env: {
                keyConfigured: !!process.env.RESEND_API_KEY
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            env: {
                keyConfigured: !!process.env.RESEND_API_KEY
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
