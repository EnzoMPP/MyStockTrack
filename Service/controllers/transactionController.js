const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.buyStock = async (req, res) => {
  try {
    const { symbol, assetName, quantity, price, assetType } = req.body;

    if (isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
      return res.status(400).json({ message: "Preço ou quantidade inválidos" });
    }

    const totalCost = price * quantity;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (user.balance < totalCost) {
      return res
        .status(400)
        .json({ message: "Saldo insuficiente para comprar ações" });
    }

    user.balance -= totalCost;
    await user.save();

    const transaction = new Transaction({
      userId: req.user.userId,
      symbol,
      assetName,
      quantity,
      price,
      transactionType: "BUY",
      assetType,
    });
    await transaction.save();

    res.status(201).json({
      message: "Ação comprada com sucesso",
      balance: user.balance,
    });
  } catch (error) {
    console.error("Erro ao comprar ação:", error);
    res.status(500).json({ message: "Erro ao comprar ação" });
  }
};

exports.sellStock = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;

    if (isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
      return res.status(400).json({ message: "Preço ou quantidade inválidos" });
    }

    const totalProceeds = price * quantity;

    const userTransactions = await Transaction.find({
      userId: req.user.userId,
      symbol,
    });

    let totalQuantity = 0;
    userTransactions.forEach((transaction) => {
      if (transaction.transactionType === "BUY") {
        totalQuantity += transaction.quantity;
      } else if (transaction.transactionType === "SELL") {
        totalQuantity -= transaction.quantity;
      }
    });

    if (totalQuantity < quantity) {
      return res
        .status(400)
        .json({ message: "Quantidade insuficiente de ações para vender" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    user.balance += totalProceeds;

    if (isNaN(user.balance)) {
      return res
        .status(500)
        .json({ message: "Erro ao atualizar saldo do usuário" });
    }

    await user.save();

    const transaction = new Transaction({
      userId: req.user.userId,
      symbol,
      quantity,
      price,
      transactionType: "SELL",
      assetType: "STOCK",
    });
    await transaction.save();

    res.status(201).json({
      message: "Ação vendida com sucesso",
      balance: user.balance,
    });
  } catch (error) {
    console.error("Erro ao vender ação:", error);
    res.status(500).json({ message: "Erro ao vender ação" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user.userId,
    }).sort({ date: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({ message: "Erro ao buscar transações" });
  }
};

exports.getDeposits = async (req, res) => {
  try {
    const deposits = await Transaction.find({
      userId: req.user.userId,
      transactionType: "DEPOSIT",
    }).sort({ date: -1 });

    res.status(200).json({ deposits });
  } catch (error) {
    console.error("Erro ao buscar depósitos:", error);
    res.status(500).json({ message: "Erro ao buscar depósitos" });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      userId: req.user.userId,
      transactionType: "WITHDRAW",
    }).sort({ date: -1 });

    res.status(200).json({ withdrawals });
  } catch (error) {
    console.error("Erro ao buscar retiradas:", error);
    res.status(500).json({ message: "Erro ao buscar retiradas" });
  }
};

exports.getTrades = async (req, res) => {
  try {
    const trades = await Transaction.find({
      userId: req.user.userId,
      transactionType: { $in: ["BUY", "SELL"] },
    }).sort({ date: -1 });

    res.status(200).json({ trades });
  } catch (error) {
    console.error("Erro ao buscar negociações:", error);
    res.status(500).json({ message: "Erro ao buscar negociações" });
  }
};
