const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/profile', authenticateToken, userController.getProfile);
router.get('/balance', authenticateToken, userController.getBalance);
router.post('/balance/deposit', authenticateToken, userController.deposit);
router.post('/balance/withdraw', authenticateToken, userController.withdraw);

module.exports = router;