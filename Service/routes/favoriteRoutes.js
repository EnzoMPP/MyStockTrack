const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, favoriteController.addFavorite);
router.delete('/:symbol', authenticateToken, favoriteController.removeFavorite);
router.get('/', authenticateToken, favoriteController.getFavorites);

module.exports = router;