import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";

class TransactionService {
  async fetchTransactions() {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const responseDeposits = await axios.get(`${BACKEND_URL}/api/transactions/deposits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deposits = responseDeposits.data.deposits;

      const responseWithdrawals = await axios.get(`${BACKEND_URL}/api/transactions/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const withdrawals = responseWithdrawals.data.withdrawals;

      
      const transactions = [...deposits, ...withdrawals];

      
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      return transactions;
    } catch (error) {
      throw new Error("Erro ao buscar transações: " + error.message);
    }
  }

  async handleTransaction(transactionType, amount) {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      throw new Error("Por favor, insira um valor válido.");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const endpoint = transactionType === "DEPOSIT" ? "/balance/deposit" : "/balance/withdraw";
      await axios.post(
        `${BACKEND_URL}${endpoint}`,
        { amount: parseFloat(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      
      // console.log("Erro na transação:", error.response);

      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.message === "Saldo insuficiente"
      ) {
        throw new Error("Saldo insuficiente para realizar a retirada.");
      } else if (error.response && error.response.data && error.response.data.message) {
        throw new Error(`Erro ao realizar ${transactionType === "DEPOSIT" ? "depósito" : "retirada"}: ${error.response.data.message}`);
      } else {
        throw new Error(`Erro ao realizar ${transactionType === "DEPOSIT" ? "depósito" : "retirada"}: ${error.message}`);
      }
    }
  }
}

export default new TransactionService();