import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { BACKEND_URL } from "@env";
import Icon from "react-native-vector-icons/FontAwesome";
import { FavoritesContext } from "../context/FavoritesContext";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FavoritosScreen() {
  const { favorites, removeFavorite, fetchFavorites } = useContext(FavoritesContext);
  const [favoriteStocks, setFavoriteStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavoriteStocks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavoriteStocks(response.data.stocks);
    } catch (error) {
      console.error("Erro ao buscar ações favoritas:", error);
      const message = error.response?.data?.message || "Falha ao buscar favoritos.";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFavoriteStocks();
    }, [favorites])  
  );

  const handleRemoveFavorite = (symbol) => {
    removeFavorite(symbol);
  };

  const renderFavoriteItem = ({ item }) => (
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
        <TouchableOpacity onPress={() => handleRemoveFavorite(item.symbol)}>
          <Icon
            name="star"
            size={24}
            color="#FFD700"
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (favoriteStocks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma ação favorita adicionada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteStocks}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.symbol}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
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