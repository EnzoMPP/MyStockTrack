import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";
import { UserContext } from "../context/UserContext";

export default function TradesScreen() {
  const { user } = useContext(UserContext);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/transactions/trades`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrades(response.data.trades);
    } catch (error) {
      console.error("Erro ao buscar trades:", error);
      Alert.alert("Erro", "Falha ao buscar negociações. Verifique o console para mais detalhes.");
    } finally {
      setLoading(false);
    }
  };

  const renderTradeItem = ({ item }) => (
    <View style={styles.tradeItem}>
      <View style={styles.tradeInfo}>
        <Text style={styles.tradeType}>{item.transactionType}</Text>
        <Text style={styles.amount}>Quantidade: {item.quantity}</Text>
        <Text style={styles.price}>Preço: R$ {item.price.toFixed(2)}</Text>
        <Text style={styles.date}>Data: {new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Carregando...</Text>
      ) : trades.length === 0 ? (
        <Text>Nenhuma negociação encontrada.</Text>
      ) : (
        <FlatList
          data={trades}
          keyExtractor={(item) => item._id}
          renderItem={renderTradeItem}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Atualizar" onPress={fetchTrades} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tradeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tradeInfo: {
    flex: 1,
  },
  tradeType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amount: {
    fontSize: 14,
    color: "#666",
  },
  price: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    marginTop: 16,
  },
});