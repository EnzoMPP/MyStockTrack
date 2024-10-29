const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/MyStockTrack').catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelo de users
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

app.post('/signup', async (req, res) => {
  const { name, cpf, email, password, address, houseNumber, complement, phone, birthDate, gender, cep } = req.body;

  if (!name || !cpf || !email || !password || !address || !houseNumber || !phone || !birthDate || !gender || !cep) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios corretamente.' });
  }

  try {
    const existingCpfUser = await User.findOne({ cpf });
    if (existingCpfUser) {
      return res.status(400).json({ error: 'CPF já está em uso.' });
    }

    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ error: 'E-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ 
      name, 
      cpf, 
      email, 
      password: hashedPassword, 
      address, 
      houseNumber, 
      complement, 
      phone, 
      birthDate, 
      gender, 
      cep 
    });
    await newUser.save();
    
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error.message);
    res.status(400).json({ error: 'Erro ao cadastrar usuário.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Senha incorreta.' });
  }

  const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
  res.json({ token });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});