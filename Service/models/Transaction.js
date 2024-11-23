const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String }, 
  assetName: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  transactionType: { type: String, enum: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW'], required: true },
  assetType: { type: String, enum: ['STOCK', 'CASH'], required: true },
  date: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;