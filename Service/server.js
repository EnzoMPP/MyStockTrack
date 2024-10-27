// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/MyStockTrack');

// Modelo de Usuário
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  birthDate: { type: String, required: true },
  gender: { type: String, required: true },
  cep: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Rota de Signup
app.post('/signup', async (req, res) => {
  const { name, email, password, address, phone, birthDate, gender, cep } = req.body;

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPassword, address, phone, birthDate, gender, cep });

  try {
    await newUser.save();
    res.status(201).send('Usuário cadastrado com sucesso!');
  } catch (error) {
    res.status(400).send('Erro ao cadastrar usuário.');
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send('Usuário não encontrado.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).send('Senha incorreta.');
  }

  const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });

  res.send({ token });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});