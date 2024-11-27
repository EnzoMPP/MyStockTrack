import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import TransactionService from "../services/TransactionService";
import TransactionList from "../components/TransactionList";
import TransactionModal from "../components/TransactionModal";
import { UserContext } from "../context/UserContext";

export default function DepositosScreen() {
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const transactions = await TransactionService.fetchTransactions();
      setTransactions(transactions);
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    try {
      await TransactionService.handleTransaction(transactionType, amount);
      Alert.alert("Sucesso", `${transactionType === "DEPOSIT" ? "Depósito" : "Retirada"} realizada com sucesso!`);
      setModalVisible(false);
      setAmount("");
      fetchTransactions();
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <View style={styles.listContainer}>
          <TransactionList transactions={transactions} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.depositButton]}
          onPress={() => {
            setTransactionType("DEPOSIT");
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Depositar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.withdrawButton]}
          onPress={() => {
            setTransactionType("WITHDRAW");
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Retirar</Text>
        </TouchableOpacity>
      </View>

      <TransactionModal
        visible={modalVisible}
        transactionType={transactionType}
        amount={amount}
        setAmount={setAmount}
        onCancel={() => {
          setModalVisible(false);
          setAmount("");
        }}
        onConfirm={handleTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 18,
  },
  listContainer: {
    flex: 1,
    marginTop: 20, 
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  depositButton: {
    backgroundColor: "#4CAF50",
  },
  withdrawButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});