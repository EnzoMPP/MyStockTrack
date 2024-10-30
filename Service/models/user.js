const mongoose = require('../config/database');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  houseNumber: { type: String, required: true },
  complement: { type: String },
  phone: { type: String, required: true },
  birthDate: { type: String, required: true },
  gender: { type: String, required: true },
  cep: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;