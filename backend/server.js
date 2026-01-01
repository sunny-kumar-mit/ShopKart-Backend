const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
