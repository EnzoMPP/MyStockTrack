import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@env";
import PortfolioSummary from "../components/PortfolioSummary";
import PortfolioChart from "../components/PortfolioChart";
import QuickActions from "../components/QuickActions";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalInvested: 0,
    currentValue: 0,
    monthlyProfitability: 0,
  });
  const [stocksData, setStocksData] = useState([]);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const { data } = await axios.get(`${BACKEND_URL}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Dados brutos do backend:", JSON.stringify(data, null, 2));

      setPortfolioSummary({
        totalInvested: parseFloat(data.totalInvested) || 0,
        currentValue: parseFloat(data.currentValue) || 0,
        monthlyProfitability: parseFloat(data.monthlyProfitability) || 0,
      });

      organizeStocksData(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const organizeStocksData = (portfolio) => {
    if (portfolio.assets && portfolio.assets.length > 0) {
      const stocks = portfolio.assets
        .filter((asset) => asset.type === "STOCK")
        .map((stock) => {
          const value = parseFloat(stock.currentValue);
          console.log(`Processando ação ${stock.symbol}: valor = ${value}`);
          return {
            symbol: stock.symbol,
            currentValue: value || 0,
          };
        })
        .sort((a, b) => b.currentValue - a.currentValue);

      console.log("Dados processados das ações:", stocks);
      setStocksData(stocks);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumo do Portfólio</Text>
      <PortfolioSummary summary={portfolioSummary} />

      <Text style={styles.subtitle}>Distribuição por Ação</Text>
      <PortfolioChart data={stocksData} />

      <Text style={styles.subtitle}>Ações Rápidas</Text>
      <QuickActions onRefresh={fetchPortfolioData} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4285F4",
  },
});