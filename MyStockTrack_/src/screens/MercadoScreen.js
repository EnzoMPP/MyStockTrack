import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Keyboard,
  Alert,
  Modal,
  Button,
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";
import Icon from "react-native-vector-icons/FontAwesome";
import { FavoritesContext } from "../context/FavoritesContext";
import { UserContext } from "../context/UserContext"; 
import { useFocusEffect } from "@react-navigation/native";

export default function MercadoScreen() {
  const { user } = useContext(UserContext); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [quantity, setQuantity] = useState("");

  const { favorites, addFavorite, removeFavorite, fetchFavorites } = useContext(FavoritesContext);

  useEffect(() => {
    fetchBalance();
    fetchStocks();
    fetchFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
      fetchStocks();
      fetchFavorites();
    }, [])
  );

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
      Alert.alert("Erro", "Não foi possível obter o saldo.");
    }
  };

  const fetchStocks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/market/stocks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStocks(response.data.stocks);
      setFilteredStocks(response.data.stocks);
    } catch (error) {
      console.error("Erro ao buscar ações:", error);
      Alert.alert("Erro", "Falha ao buscar ações. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchStocks = async (term) => {
    if (!term) {
      setFilteredStocks(stocks);
      return;
    }
    try {
      setSearchLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        setSearchLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/stocks/search/${term.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedStocks = response.data.map(stock => ({
        symbol: stock.symbol,
        companyName: stock.description,
        logo: stock.company.logo,
        currentPrice: stock.quote.c,
        changePercent: stock.quote.dp,
      }));

      setFilteredStocks(mappedStocks);
    } catch (error) {
      console.error("Erro ao pesquisar ações:", error);
      Alert.alert("Erro", "Falha ao pesquisar ações.");
    } finally {
      setSearchLoading(false);
    }
  };

  const buyStock = async () => {
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      Alert.alert("Erro", "Por favor, insira uma quantidade válida.");
      return;
    }

    const stock = stocks.find((item) => item.symbol === selectedSymbol);
    if (!stock) {
      Alert.alert("Erro", "Ação selecionada não encontrada.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/transactions/buy`,
        {
          symbol: selectedSymbol,
          assetName: stock.companyName,
          quantity: parseInt(quantity),
          price: stock.currentPrice,
          assetType: "STOCK",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Sucesso", "Ação comprada com sucesso!");
      setBalance(response.data.balance);
      setModalVisible(false);
      setQuantity("");
      fetchStocks(); 
    } catch (error) {
      console.error("Erro ao comprar ação:", error);
      Alert.alert("Erro", error.response?.data?.message || "Falha ao comprar a ação.");
    }
  };

  const toggleFavorite = (symbol) => {
    if (favorites.includes(symbol)) {
      removeFavorite(symbol);
    } else {
      addFavorite(symbol);
    }
  };

  const renderItem = ({ item }) => {
    const isFavorite = favorites.includes(item.symbol);
    return (
      <View style={styles.stockItem}>
        <View style={styles.stockInfo}>
          <Image
            source={{ uri: item.logo || "https://via.placeholder.com/50" }}
            style={styles.logo}
          />
          <View>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
              {item.companyName}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item.symbol)}>
          <Icon
            name={isFavorite ? "star" : "star-o"}
            size={24}
            color={isFavorite ? "#FFD700" : "#ccc"}
          />
        </TouchableOpacity>

        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            {item.currentPrice !== undefined && item.currentPrice !== null
              ? `$${item.currentPrice.toFixed(2)}`
              : "N/A"}
          </Text>
          <View
            style={[
              styles.changeContainer,
              {
                backgroundColor:
                  item.changePercent >= 0 ? "#e6f4ea" : "#fce8e6",
              },
            ]}
          >
            <Text
              style={{
                color: item.changePercent >= 0 ? "#34A853" : "#EA4335",
              }}
            >
              {item.changePercent >= 0 ? "+" : ""}
              {item.changePercent !== undefined && item.changePercent !== null
                ? `${item.changePercent.toFixed(2)}%`
                : "N/A"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => {
            setSelectedSymbol(item.symbol);
            setModalVisible(true);
          }}
        >
          <Text style={styles.buyButtonText}>Comprar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Saldo: R$ {balance.toFixed(2)}</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar ações..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          searchStocks(text);
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.symbol}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchStocks} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma ação encontrada.</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setQuantity("");
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comprar Ação</Text>
            <Text style={styles.modalSymbol}>{selectedSymbol}</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setModalVisible(false);
                  setQuantity("");
                }}
              />
              <Button title="Comprar" onPress={buyStock} />
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
  balanceContainer: {
    marginTop: 49,
    marginBottom: 16,
    alignItems: "center",
  },
  balanceText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
  },
  symbol: {
    fontSize: 16,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    alignItems: "flex-end",
    marginRight: 10,
    width: 100,
    flex: 1,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  changeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
  modalSymbol: {
    fontSize: 16,
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