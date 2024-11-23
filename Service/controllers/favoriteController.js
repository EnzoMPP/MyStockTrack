const User = require('../models/User');
const axios = require('axios');
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

exports.addFavorite = async (req, res) => {
  try {
    const { symbol } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (user.favorites.includes(symbol)) {
      return res.status(400).json({ message: 'Ação já está nos favoritos.' });
    }

    user.favorites.push(symbol);
    await user.save();

    res.status(200).json({
      message: 'Ação adicionada aos favoritos.',
      favorites: user.favorites,
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar favorito:', error);
    res.status(500).json({ message: 'Erro ao adicionar favorito.' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { symbol } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (!user.favorites.includes(symbol)) {
      return res.status(400).json({ message: 'Ação não está nos favoritos.' });
    }

    user.favorites = user.favorites.filter((fav) => fav !== symbol);
    await user.save();

    res.status(200).json({
      message: 'Ação removida dos favoritos.',
      favorites: user.favorites,
    });
  } catch (error) {
    console.error('❌ Erro ao remover favorito:', error);
    res.status(500).json({ message: 'Erro ao remover favorito.' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const favoriteSymbols = user.favorites;

    if (favoriteSymbols.length === 0) {
      return res
        .status(200)
        .json({ stocks: [], timestamp: new Date().toISOString() });
    }

    const stocksPromises = favoriteSymbols.map(async (symbol) => {
      try {
        const [quoteResponse, companyResponse] = await Promise.all([
          axios.get('https://finnhub.io/api/v1/quote', {
            params: { symbol, token: FINNHUB_API_KEY },
          }),
          axios.get('https://finnhub.io/api/v1/stock/profile2', {
            params: { symbol, token: FINNHUB_API_KEY },
          }),
        ]);

        const quote = quoteResponse.data;
        const company = companyResponse.data;

        return {
          symbol,
          companyName: company.name || symbol,
          currentPrice: quote.c || 0,
          change: quote.d || 0,
          changePercent: quote.dp || 0,
          high: quote.h || 0,
          low: quote.l || 0,
          previousClose: quote.pc || 0,
          logo: company.logo || null,
          currency: company.currency || 'USD',
        };
      } catch (error) {
        console.error(`❌ Erro ao obter dados para ${symbol}:`, error.message);
        return null;
      }
    });

    const stocks = (await Promise.all(stocksPromises)).filter(
      (stock) => stock !== null
    );

    stocks.sort((a, b) => b.changePercent - a.changePercent);

    res.status(200).json({
      stocks: stocks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos:', error);
    res.status(500).json({ message: 'Erro ao buscar favoritos' });
  }
};