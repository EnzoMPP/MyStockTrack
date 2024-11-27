import React, { useState, useContext, useEffect } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import axios from "axios";
import { BACKEND_URL } from "@env";
import { FavoritesContext } from "../context/FavoritesContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoriteStockList from "../components/FavoritesScreen/FavoriteStockList";

export default function FavoritosScreen() {
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const [favoriteStocks, setFavoriteStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteStocks();
  }, [favorites]);

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

  const handleRemoveFavorite = (symbol) => {
    setFavoriteStocks((prevStocks) => prevStocks.filter(stock => stock.symbol !== symbol));
    removeFavorite(symbol);
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
      <FavoriteStockList stocks={favoriteStocks} onRemove={handleRemoveFavorite} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});