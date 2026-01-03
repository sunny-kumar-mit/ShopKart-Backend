const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const fs = require('fs');
const { sendEmail, sendSms } = require('../utils/notification');

// Register (Step 1: Create User (Unverified) & Send Dual OTPs)
router.post('/register', async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;

        // Check if email or mobile already exists
        let user = await User.findOne({ $or: [{ email }, { mobile }] });
        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User with this email or mobile already exists' });
        }

        // If user exists but not verified, update them. Else create new.
        if (!user) {
            user = new User({ name, email, mobile, password, isVerified: false });
        } else {
            user.name = name;
            user.mobile = mobile;
            user.password = password; // Will be re-hashed by pre-save
        }

        // Generate Dual OTPs
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();

        user.emailOtp = emailOtp;
        user.mobileOtp = mobileOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

        await user.save();
        console.log(`[DEBUG] User saved/updated: ${user.email} (ID: ${user._id})`);

        // SAVE OTPs TO FILE (DEBUGGING)
        fs.writeFileSync('otp.txt', `[REGISTER] Email OTP: ${emailOtp} | Mobile OTP: ${mobileOtp}`);

        // Send Email OTP
        await sendEmail(email, 'ShopKart Registration Code', `Your Email OTP is: ${emailOtp}`);

        // Send Mobile OTP (Twilio)
        await sendSms(mobile, `Your ShopKart verification code is: ${mobileOtp}`);

        console.log(`[DEV MODE] Register OTPs -> Email: ${emailOtp}, Mobile: ${mobileOtp}`);

        res.json({ message: 'OTPs sent', identifier: email });

    } catch (err) {
        console.error('[REGISTER ERROR]', err);
        res.status(500).json({ message: err.message });
    }
});

// Verify OTP (Step 2: Verify & Login)
router.post('/verify-otp', async (req, res) => {
    try {
        const { identifier, otp, emailOtp, mobileOtp } = req.body;
        console.log(`[VERIFY-OTP] Request:`, { identifier, otp, emailOtp, mobileOtp });

        // identifier can be email or mobile
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });

        if (!user) {
            console.log(`[VERIFY-OTP] User not found for identifier: '${identifier}'`);
            return res.status(400).json({ message: 'User not found' });
        }
        console.log(`[VERIFY-OTP] User found: ${user.email} (Verified: ${user.isVerified})`);

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        let isVerified = false;

        // Dual Verification (Registration)
        if (emailOtp && mobileOtp) {
            if (user.emailOtp === emailOtp && user.mobileOtp === mobileOtp) {
                isVerified = true;
            } else {
                return res.status(400).json({ message: 'Invalid OTPs' });
            }
        }
        // Single Verification (Login)
        else if (otp) {
            if (user.emailOtp === otp || user.mobileOtp === otp) {
                isVerified = true;
            } else {
                return res.status(400).json({ message: 'Invalid OTP' });
            }
        }
        else {
            return res.status(400).json({ message: 'OTP required' });
        }

        // Verify Success
        user.isVerified = true;
        user.emailOtp = undefined;
        user.mobileOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Create Token
        const payload = { user: { id: user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

// Login (Step 1: Check Credentials & Send Single OTP)
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Generate Single OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

        let message = '';

        // Check if identifier matches Email or Mobile and assign generic OTP
        // We will assign to the appropriate field and leave the other undefined/old.
        if (user.email === identifier) {
            user.emailOtp = otp;
            user.mobileOtp = undefined; // Clear other
            message = 'OTP sent to email';

            await sendEmail(user.email, 'ShopKart Login Code', `Your login code is: ${otp}`);
        } else {
            // Must be mobile
            user.mobileOtp = otp;
            user.emailOtp = undefined;
            message = 'OTP sent to mobile';

            // Send SMS
            sendSms(user.mobile, `Your ShopKart login code is: ${otp}`);
        }

        await user.save();

        // SAVE OTP TO FILE (DEBUGGING)
        fs.writeFileSync('otp.txt', `[LOGIN] OTP for ${identifier}: ${otp}`);
        console.log(`[DEV MODE] Login OTP for ${identifier}: ${otp}`);

        res.json({ message, identifier: identifier });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

// Forgot Password (Step 1: Send OTPs)
router.post('/forgot-password', async (req, res) => {
    try {
        const { identifier } = req.body;
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate Dual OTPs
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();

        user.emailOtp = emailOtp;
        user.mobileOtp = mobileOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        // Send Notifications
        await sendEmail(user.email, 'ShopKart Password Reset', `Your Email OTP is: ${emailOtp}`);
        await sendSms(user.mobile, `Your ShopKart password reset code is: ${mobileOtp}`);

        // For debugging
        fs.writeFileSync('otp.txt', `[RESET_PWD] Email: ${emailOtp} | Mobile: ${mobileOtp}`);

        res.json({ message: 'OTPs sent to registered email and mobile' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Reset Password (Step 2: Verify & Update)
router.post('/reset-password', async (req, res) => {
    try {
        const { identifier, emailOtp, mobileOtp, newPassword } = req.body;
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (user.emailOtp !== emailOtp || user.mobileOtp !== mobileOtp) {
            return res.status(400).json({ message: 'Invalid OTPs' });
        }

        user.password = newPassword; // Will be hashed by pre-save
        user.emailOtp = undefined;
        user.mobileOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const passport = require('passport');

// Google Auth Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed` }),
    (req, res) => {
        // Generate JWT
        const payload = { user: { id: req.user.id } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=token_error`);

                // Redirect to frontend with token
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                res.redirect(`${frontendUrl}/auth/callback?token=${token}&userId=${req.user.id}&name=${encodeURIComponent(req.user.name)}&email=${req.user.email}`);
            }
        );
    }
);

module.exports = router;
