const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -otp -emailOtp -mobileOtp');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, gender, dob, preferences, mobile } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Basic fields
        if (name) user.name = name;
        if (gender) user.gender = gender;
        if (dob) user.dob = dob;

        // Preferences (merge)
        // Preferences (merge)
        if (preferences) {
            if (preferences.language) user.preferences.language = preferences.language;
            if (preferences.notifications) {
                user.preferences.notifications = {
                    ...user.preferences.notifications,
                    ...preferences.notifications
                };
            }
        }

        // Mobile update with verification logic could go here
        // For now, we allow direct update or require a separate verify flow
        if (mobile && mobile !== user.mobile) {
            // Check if mobile is taken
            const mobileExists = await User.findOne({ mobile });
            if (mobileExists) {
                return res.status(400).json({ message: 'Mobile number already in use' });
            }
            user.mobile = mobile;
            user.isVerified = false; // Require re-verification if strictly enforcing
        }

        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            gender: user.gender,
            dob: user.dob,
            preferences: user.preferences
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const { sendEmail, sendSms } = require('../utils/notification');
const fs = require('fs');

// @desc    Initiate Change Password (Step 1: Verify Current & Send OTPs)
// @route   POST /api/user/change-password/init
// @access  Private
exports.initiateChangePassword = async (req, res) => {
    try {
        const { currentPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.password) {
            return res.status(400).json({ message: 'User uses social login. Set password via "Forgot Password".' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        // Generate Dual OTPs
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();

        user.emailOtp = emailOtp;
        user.mobileOtp = mobileOtp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        // SAVE OTPs TO FILE (DEBUGGING)
        fs.writeFileSync('otp.txt', `[CHANGE_PWD] Email OTP: ${emailOtp} | Mobile OTP: ${mobileOtp}`);
        console.log(`[DEV MODE] Change Pwd OTPs -> Email: ${emailOtp}, Mobile: ${mobileOtp}`);

        // Send Notifications
        sendEmail(user.email, 'ShopKart Password Change Verification', `Your Email OTP is: ${emailOtp}`);
        sendSms(user.mobile, `Your ShopKart password change code is: ${mobileOtp}`);

        res.json({ message: 'OTPs sent successfully to email and mobile' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Verify Change Password OTP (Step 2: Verify & Update)
// @route   POST /api/user/change-password/verify
// @access  Private
exports.verifyChangePasswordOTP = async (req, res) => {
    try {
        const { emailOtp, mobileOtp, newPassword } = req.body;
        const user = await User.findById(req.user.id);

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

        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete account
// @route   DELETE /api/user/delete-account
// @access  Private
exports.deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
