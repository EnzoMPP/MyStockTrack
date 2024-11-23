import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";
import { UserContext } from "../context/UserContext";

export default function TransacoesScreen() {
  const { user } = useContext(UserContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const response = await axios.get(`${BACKEND_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      Alert.alert("Erro", "Falha ao buscar transações. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <Text style={styles.transactionType}>{item.transactionType}</Text>
        <Text style={styles.quantity}>Quantidade: {item.quantity}</Text>
        <Text style={styles.price}>Preço: R$ {item.price.toFixed(2)}</Text>
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
  symbol: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionType: {
    fontSize: 14,
    color: "#666",
  },
  quantity: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 14,
    color: "#666",
  },
});