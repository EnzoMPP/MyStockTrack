import React, { useState, useEffect } from "react";
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
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@env";

export default function MercadoScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);

  const fetchStocks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${BACKEND_URL}/market/stocks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStocks(response.data.stocks);
      setFilteredStocks(response.data.stocks);
    } catch (error) {
      console.error("Erro ao buscar ações:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const filtered = stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStocks(filtered);
  }, [searchQuery, stocks]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStocks();
  }, []);

  const renderStockItem = ({ item }) => (
    <TouchableOpacity style={styles.stockCard}>
      <View style={styles.stockHeader}>
        <View style={styles.stockInfo}>
          {item.logo ? (
            <Image source={{ uri: item.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{item.symbol[0]}</Text>
            </View>
          )}
          <View>
            <Text style={styles.symbolText}>{item.symbol}</Text>
            <Text style={styles.companyName}>{item.companyName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.currentPrice}>
          ${item.currentPrice.toFixed(2)}
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
            style={[
              styles.changeText,
              {
                color: item.changePercent >= 0 ? "#137333" : "#c5221f",
              },
            ]}
          >
            {item.changePercent >= 0 ? "+" : ""}
            {item.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar ações..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="characters"
        />
      </View>
      <FlatList
        data={filteredStocks}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.symbol}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  stockCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  symbolText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  companyName: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  changeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  }
});