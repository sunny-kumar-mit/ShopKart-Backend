const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// All routes are protected
router.use(auth);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
// router.patch('/change-password', userController.changePassword); // Deprecated
router.post('/change-password/init', userController.initiateChangePassword);
router.post('/change-password/verify', userController.verifyChangePasswordOTP);
router.delete('/delete-account', userController.deleteAccount);

module.exports = router;
