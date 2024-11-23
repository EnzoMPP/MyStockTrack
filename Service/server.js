require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const marketRoutes = require('./routes/marketRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/market', marketRoutes);
app.use('/api/favorites', favoriteRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});