const bcrypt = require('bcrypt');
const User = require('../models/user');
const { hashPassword, generateToken } = require('../utils/helpers');

const signup = async (req, res) => {
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

    const hashedPassword = await hashPassword(password);

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
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Senha incorreta.' });
  }

  const token = generateToken(user._id);
  res.json({ token });
};

module.exports = { signup, login };