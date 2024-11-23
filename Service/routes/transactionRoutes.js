const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post("/buy", authenticateToken, transactionController.buyStock);

router.post("/sell", authenticateToken, transactionController.sellStock);

router.get("/", authenticateToken, transactionController.getTransactions);

router.get("/deposits", authenticateToken, transactionController.getDeposits);

router.get(
  "/withdrawals",
  authenticateToken,
  transactionController.getWithdrawals
);

router.get("/trades", authenticateToken, transactionController.getTrades);

module.exports = router;
