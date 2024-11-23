const User = require('../models/User');

exports.getProfile = async (req, res) => {
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
};

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error('❌ Erro ao buscar saldo:', error);
    res.status(500).json({ message: 'Erro ao buscar saldo' });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Valor inválido para depósito' });
    }
    const user = await User.findById(req.user.userId);
    user.balance += amount;
    await user.save();

    res.status(200).json({
      message: 'Depósito realizado com sucesso',
      balance: user.balance,
    });
  } catch (error) {
    console.error('❌ Erro ao depositar saldo:', error);
    res.status(500).json({ message: 'Erro ao depositar saldo' });
  }
};

exports.withdraw = async (req, res) => {
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

    res.status(200).json({
      message: 'Retirada realizada com sucesso',
      balance: user.balance,
    });
  } catch (error) {
    console.error('❌ Erro ao retirar saldo:', error);
    res.status(500).json({ message: 'Erro ao retirar saldo' });
  }
};