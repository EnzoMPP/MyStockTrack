const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/stocks', authenticateToken, marketController.getMarketStocks);
router.get('/stocks/search/:term', authenticateToken, marketController.searchStocks);

module.exports = router;