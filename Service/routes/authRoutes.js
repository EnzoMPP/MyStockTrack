const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;