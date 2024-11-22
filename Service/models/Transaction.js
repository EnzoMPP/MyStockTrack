// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },                  
  assetName: { type: String },                               
  quantity: { type: Number, required: true },                
  price: { type: Number, required: true },                   
  transactionType: { type: String, enum: ['BUY', 'SELL'], required: true }, 
  assetType: { type: String, required: true },               
  date: { type: Date, default: Date.now },                   
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;