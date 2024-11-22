require('dotenv').config();
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

app.use(cors());
app.use(express.json());

// Conectar ao banco de dados
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso');
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ Token não fornecido');
    return res.status(401).json({ message: 'Token não encontrado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token inválido:', err.message);
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

app.get('/auth/google', (req, res) => {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });

  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  console.log('📍 Callback Google recebido');
  const { code } = req.query;

  if (!code) {
    console.error('❌ Código não encontrado');
    return res.status(400).json({ message: 'Código ausente' });
  }

  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    console.log('🔄 Obtendo tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('🔄 Obtendo dados do usuário...');
    const userInfoResponse = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    const userInfo = userInfoResponse.data;

    let user = await User.findOne({ googleId: userInfo.sub });

    if (!user) {
      console.log('🆕 Criando novo usuário');
      user = await User.create({
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
        balance: 0, // Iniciando saldo em zero
      });
    }

    const jwtToken = generateToken(user);
    console.log('✅ JWT gerado');

    const redirectUrl = `${process.env.IP_MOBILE}?token=${jwtToken}`;
    console.log('🔄 Redirecionando para:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ message: 'Erro na autenticação' });
  }
});

app.get('/profile', authenticateToken, async (req, res) => {
  console.log('📍 Acessando perfil de:', req.user.email);
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json({
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      balance: user.balance,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

app.post('/balance/deposit', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Valor inválido para depósito' });
    }
    const user = await User.findById(req.user.userId);
    user.balance += amount;
    await user.save();
    res.status(200).json({ message: 'Depósito realizado com sucesso', balance: user.balance });
  } catch (error) {
    console.error('❌ Erro ao depositar saldo:', error);
    res.status(500).json({ message: 'Erro ao depositar saldo' });
  }
});

app.post('/balance/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Valor inválido para retirada' });
    }
    const user = await User.findById(req.user.userId);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }
    user.balance -= amount;
    await user.save();
    res.status(200).json({ message: 'Retirada realizada com sucesso', balance: user.balance });
  } catch (error) {
    console.error('❌ Erro ao retirar saldo:', error);
    res.status(500).json({ message: 'Erro ao retirar saldo' });
  }
});

app.post('/transactions/buy', authenticateToken, async (req, res) => {
  try {
    const { symbol, assetName, quantity, price, assetType } = req.body;
    const totalCost = price * quantity;

    const user = await User.findById(req.user.userId);
    if (user.balance < totalCost) {
      return res.status(400).json({ message: 'Saldo insuficiente para comprar ações' });
    }

    // Deduzir o valor do saldo do usuário
    user.balance -= totalCost;
    await user.save();

    // Registrar a transação
    const transaction = new Transaction({
      userId: req.user.userId,
      symbol,
      assetName,
      quantity,
      price,
      transactionType: 'BUY',
      assetType,
    });
    await transaction.save();

    res.status(201).json({ message: 'Ação comprada com sucesso', balance: user.balance });
  } catch (error) {
    console.error('❌ Erro ao comprar ação:', error);
    res.status(500).json({ message: 'Erro ao comprar ação' });
  }
});

app.post('/transactions/sell', authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const totalProceeds = price * quantity;

    // Verificar se o usuário possui ações suficientes
    const userTransactions = await Transaction.find({ userId: req.user.userId, symbol });
    let totalQuantity = 0;
    userTransactions.forEach(transaction => {
      if (transaction.transactionType === 'BUY') {
        totalQuantity += transaction.quantity;
      } else if (transaction.transactionType === 'SELL') {
        totalQuantity -= transaction.quantity;
      }
    });

    if (totalQuantity < quantity) {
      return res.status(400).json({ message: 'Quantidade insuficiente de ações para vender' });
    }

    // Adicionar o valor ao saldo do usuário
    const user = await User.findById(req.user.userId);
    user.balance += totalProceeds;
    await user.save();

    // Registrar a transação
    const transaction = new Transaction({
      userId: req.user.userId,
      symbol,
      quantity,
      price,
      transactionType: 'SELL',
      assetType: 'STOCK', // Ajustar conforme necessário
    });
    await transaction.save();

    res.status(201).json({ message: 'Ação vendida com sucesso', balance: user.balance });
  } catch (error) {
    console.error('❌ Erro ao vender ação:', error);
    res.status(500).json({ message: 'Erro ao vender ação' });
  }
});

app.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });

    if (!transactions) {
      return res.status(200).json({
        totalInvested: 0,
        currentValue: 0,
        monthlyProfitability: 0,
        assets: [],
      });
    }

    const portfolioAssets = {};

    transactions.forEach(transaction => {
      const { symbol, quantity, price, transactionType, assetType } = transaction;

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
        portfolioAssets[symbol].averagePrice = portfolioAssets[symbol].totalCost / portfolioAssets[symbol].quantity;
      } else {
        portfolioAssets[symbol].averagePrice = 0;
        portfolioAssets[symbol].totalCost = 0;
      }
    });

    const assets = Object.values(portfolioAssets).filter(asset => asset.quantity > 0);

    const assetQuotesPromises = assets.map(async asset => {
      try {
        // Ajusta o símbolo para o formato do Finnhub (ações brasileiras)
        const formattedSymbol = `${asset.symbol}.SAO`;
        
        console.log(`🔍 Buscando cotação para: ${formattedSymbol}`); // Debug

        const response = await axios.get('https://finnhub.io/api/v1/quote', {
          params: {
            symbol: formattedSymbol,
            token: FINNHUB_API_KEY,
          },
        });

        const currentPrice = response.data?.c || asset.averagePrice; // Usa preço médio como fallback
        const currentValue = currentPrice * asset.quantity;

        console.log(`💰 ${asset.symbol}: Preço atual = ${currentPrice}, Valor total = ${currentValue}`); // Debug

        return {
          ...asset,
          currentPrice,
          currentValue,
        };
      } catch (error) {
        console.error(`❌ Erro ao obter preço de ${asset.symbol}:`, error.message);
        // Fallback para preço médio em caso de erro
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

    assetsWithQuotes.forEach(asset => {
      totalInvested += asset.totalCost;
      currentValue += asset.currentValue;
    });

    const portfolioSummary = {
      totalInvested: totalInvested || 0,
      currentValue: currentValue || 0,
      monthlyProfitability: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
      assets: assetsWithQuotes,
    };

    console.log('📊 Portfolio Summary:', portfolioSummary);

    res.status(200).json(portfolioSummary);

  } catch (error) {
    console.error('❌ Erro ao obter portfólio:', error);
    res.status(500).json({ message: 'Erro ao obter portfólio' });
  }
});

app.get('/market/stocks', authenticateToken, async (req, res) => {
  try {
    // Lista de ações que queremos mostrar (você pode expandir essa lista)
    const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM'];
    
    // Buscar informações de cada ação
    const stocksPromises = stockSymbols.map(async (symbol) => {
      try {
        // Buscar cotação atual
        const quoteResponse = await axios.get('https://finnhub.io/api/v1/quote', {
          params: {
            symbol: symbol,
            token: FINNHUB_API_KEY
          }
        });

        // Buscar informações da empresa
        const companyResponse = await axios.get('https://finnhub.io/api/v1/stock/profile2', {
          params: {
            symbol: symbol,
            token: FINNHUB_API_KEY
          }
        });

        const quote = quoteResponse.data;
        const company = companyResponse.data;

        return {
          symbol: symbol,
          companyName: company.name || symbol,
          currentPrice: quote.c || 0,
          change: quote.d || 0, // Mudança em valor
          changePercent: quote.dp || 0, // Mudança percentual
          high: quote.h || 0, // Máxima do dia
          low: quote.l || 0, // Mínima do dia
          previousClose: quote.pc || 0, // Fechamento anterior
          logo: company.logo || null,
          currency: company.currency || 'USD',
        };
      } catch (error) {
        console.error(`❌ Erro ao obter dados para ${symbol}:`, error.message);
        return null;
      }
    });

    const stocks = (await Promise.all(stocksPromises)).filter(stock => stock !== null);

    // Ordenar por variação percentual (do maior para o menor)
    stocks.sort((a, b) => b.changePercent - a.changePercent);

    res.status(200).json({
      stocks: stocks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar ações:', error);
    res.status(500).json({ message: 'Erro ao buscar ações' });
  }
});

app.post('/logout', authenticateToken, (req, res) => {
  console.log('📍 Logout solicitado por:', req.user.email);
  res.status(200).json({ message: 'Logout bem-sucedido' });
});

app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
});