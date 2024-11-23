const Transaction = require('../models/Transaction');
const axios = require('axios');
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

exports.getPortfolio = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        totalInvested: 0,
        currentValue: 0,
        monthlyProfitability: 0,
        assets: [],
      });
    }

    const portfolioAssets = {};

    transactions.forEach((transaction) => {
      const { symbol, quantity, price, transactionType, assetType } =
        transaction;

      if (!portfolioAssets[symbol]) {
        portfolioAssets[symbol] = {
          symbol,
          quantity: 0,
          totalCost: 0,
          averagePrice: 0,
          type: assetType || 'STOCK',
        };
      }

      if (transactionType === 'BUY') {
        portfolioAssets[symbol].quantity += quantity;
        portfolioAssets[symbol].totalCost += price * quantity;
      } else if (transactionType === 'SELL') {
        portfolioAssets[symbol].quantity -= quantity;
        portfolioAssets[symbol].totalCost -= price * quantity;
      }

      if (portfolioAssets[symbol].quantity > 0) {
        portfolioAssets[symbol].averagePrice =
          portfolioAssets[symbol].totalCost / portfolioAssets[symbol].quantity;
      } else {
        portfolioAssets[symbol].averagePrice = 0;
        portfolioAssets[symbol].totalCost = 0;
      }
    });

    const assets = Object.values(portfolioAssets).filter(
      (asset) => asset.quantity > 0
    );

    const assetQuotesPromises = assets.map(async (asset) => {
      try {
        const formattedSymbol = `${asset.symbol}.SAO`;

        console.log(`🔍 Buscando cotação para: ${formattedSymbol}`);

        const response = await axios.get('https://finnhub.io/api/v1/quote', {
          params: {
            symbol: formattedSymbol,
            token: FINNHUB_API_KEY,
          },
        });

        const currentPrice = response.data?.c || asset.averagePrice;
        const currentValue = currentPrice * asset.quantity;

        console.log(
          `💰 ${asset.symbol}: Preço atual = ${currentPrice}, Valor total = ${currentValue}`
        );

        return {
          ...asset,
          currentPrice,
          currentValue,
        };
      } catch (error) {
        console.error(
          `❌ Erro ao obter preço de ${asset.symbol}:`,
          error.message
        );

        return {
          ...asset,
          currentPrice: asset.averagePrice,
          currentValue: asset.averagePrice * asset.quantity,
        };
      }
    });

    const assetsWithQuotes = await Promise.all(assetQuotesPromises);

    let totalInvested = 0;
    let currentValue = 0;

    assetsWithQuotes.forEach((asset) => {
      totalInvested += asset.totalCost;
      currentValue += asset.currentValue;
    });

    const portfolioSummary = {
      totalInvested: totalInvested || 0,
      currentValue: currentValue || 0,
      monthlyProfitability:
        totalInvested > 0
          ? ((currentValue - totalInvested) / totalInvested) * 100
          : 0,
      assets: assetsWithQuotes,
    };

    console.log('📊 Portfolio Summary:', portfolioSummary);

    res.status(200).json(portfolioSummary);
  } catch (error) {
    console.error('❌ Erro ao obter portfólio:', error);
    res.status(500).json({ message: 'Erro ao obter portfólio' });
  }
};