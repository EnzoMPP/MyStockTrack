require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

module.exports = mongoose;