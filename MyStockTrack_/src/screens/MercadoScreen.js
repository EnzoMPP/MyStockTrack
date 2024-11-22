import React, { useState, useEffect, useContext } from "react";
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
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";
import Icon from "react-native-vector-icons/FontAwesome";
import { FavoritesContext } from "../context/FavoritesContext";
import { useFocusEffect } from "@react-navigation/native";

export default function MercadoScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { favorites, addFavorite, removeFavorite, fetchFavorites } = useContext(FavoritesContext);

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

  useEffect(() => {
    const initialize = async () => {
      await fetchStocks();
      await fetchFavorites();
    };
    initialize();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchStocks();
      fetchFavorites();
    }, [])
  );

  const toggleFavorite = (symbol) => {
    if (favorites.includes(symbol)) {
      removeFavorite(symbol);
    } else {
      addFavorite(symbol);
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStocks();
    fetchFavorites();
  }, []);

  const renderStockItem = ({ item }) => {
    const isFavorite = favorites.includes(item.symbol);
    return (
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
          <TouchableOpacity onPress={() => toggleFavorite(item.symbol)}>
            <Icon
              name={isFavorite ? "star" : "star-o"}
              size={24}
              color={isFavorite ? "#FFD700" : "#ccc"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            ${item.currentPrice !== undefined && item.currentPrice !== null ? item.currentPrice.toFixed(2) : 'N/A'}
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
                  color:
                    item.changePercent >= 0 ? "#137333" : "#c5221f",
                },
              ]}
            >
              {item.changePercent >= 0 ? "+" : ""}
              {item.changePercent !== undefined && item.changePercent !== null ? item.changePercent.toFixed(2) : '0.00'}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          onChangeText={(text) => setSearchQuery(text)}
          autoCapitalize="characters"
          returnKeyType="search"
          keyboardType="default"
          clearButtonMode="while-editing"
          onSubmitEditing={() => {
            searchStocks(searchQuery);
            Keyboard.dismiss();
          }}
        />
        {searchLoading && <ActivityIndicator size="small" color="#4285F4" />}
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
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
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
});