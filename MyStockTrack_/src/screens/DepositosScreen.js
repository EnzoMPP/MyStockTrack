import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";
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
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        setLoading(false);
        return;
      }

      const responseDeposits = await axios.get(`${BACKEND_URL}/api/transactions/deposits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deposits = responseDeposits.data.deposits;

      const responseWithdrawals = await axios.get(`${BACKEND_URL}/api/transactions/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const withdrawals = responseWithdrawals.data.withdrawals;

      setTransactions([...deposits, ...withdrawals]);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      Alert.alert("Erro", "Falha ao buscar transações. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Erro", "Por favor, insira um valor válido.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
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
      Alert.alert("Sucesso", `${transactionType === "DEPOSIT" ? "Depósito" : "Retirada"} realizada com sucesso!`);
      setModalVisible(false);
      setAmount("");
      fetchTransactions();
    } catch (error) {
      console.error(`Erro ao realizar ${transactionType === "DEPOSIT" ? "depósito" : "retirada"}:`, error);
      Alert.alert("Erro", error.response?.data?.message || `Falha ao realizar ${transactionType === "DEPOSIT" ? "depósito" : "retirada"}.`);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionType}>{item.transactionType}</Text>
        <Text style={styles.amount}>Valor: $ {item.price.toFixed(2)}</Text>
        <Text style={styles.date}>Data: {new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text>Nenhuma transação encontrada.</Text>}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Depositar" onPress={() => {
          setTransactionType("DEPOSIT");
          setModalVisible(true);
        }} />
        <Button title="Retirar" onPress={() => {
          setTransactionType("WITHDRAW");
          setModalVisible(true);
        }} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setAmount("");
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{transactionType === "DEPOSIT" ? "Depositar" : "Retirar"} Dinheiro</Text>
            <TextInput
              style={styles.input}
              placeholder="Valor"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setModalVisible(false);
                  setAmount("");
                }}
              />
              <Button title={transactionType === "DEPOSIT" ? "Depositar" : "Retirar"} onPress={handleTransaction} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amount: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});