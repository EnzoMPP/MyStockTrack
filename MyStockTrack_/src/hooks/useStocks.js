import { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";
import { Alert } from "react-native";

export const useStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStocks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/market/stocks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStocks(response.data.stocks);
      setFilteredStocks(response.data.stocks);
    //   console.log("Stocks fetched:", response.data.stocks);
    } catch (error) {
      console.error("Erro ao buscar ações:", error);
      Alert.alert("Erro", "Falha ao buscar ações. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const searchStocksHandler = async () => {
    if (!searchQuery) {
      setFilteredStocks(stocks);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/market/stocks/search/${searchQuery.toUpperCase()}`, {
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
    //   console.log("Stocks searched:", mappedStocks);
    } catch (error) {
      console.error("Erro ao pesquisar ações:", error);
      Alert.alert("Erro", "Falha ao pesquisar ações.");
    }
  };

  return {
    stocks,
    filteredStocks,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    fetchStocks,
    searchStocks: searchStocksHandler,
  };
};