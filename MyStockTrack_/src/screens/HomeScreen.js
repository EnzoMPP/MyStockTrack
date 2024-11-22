import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Plotly from "react-native-plotly";
import CustomButton from "../components/CustomButton";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FINNHUB_API_KEY, BACKEND_URL } from "@env";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalInvested: 0,
    currentValue: 0,
    monthlyProfitability: 0,
  });

  const [investmentCategories, setInvestmentCategories] = useState([]);
  const [stockQuotes, setStockQuotes] = useState({});

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const portfolioResponse = await axios.get(`${BACKEND_URL}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const quotes = {};
      for (const stock of portfolioResponse.data.stocks) {
        const quoteResponse = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_API_KEY}`
        );
        quotes[stock.symbol] = quoteResponse.data;
      }

      setStockQuotes(quotes);
      updatePortfolioSummary(portfolioResponse.data, quotes);
      organizeInvestmentCategories(portfolioResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolioSummary = (portfolio, quotes) => {
    let currentValue = 0;
    let totalInvested = 0;

    portfolio.stocks.forEach((stock) => {
      const quote = quotes[stock.symbol];
      if (quote) {
        currentValue += quote.c * stock.quantity;
        totalInvested += stock.averagePrice * stock.quantity;
      }
    });

    const monthlyProfitability =
      ((currentValue - totalInvested) / totalInvested) * 100;

    setPortfolioSummary({
      totalInvested,
      currentValue,
      monthlyProfitability,
    });
  };

  const organizeInvestmentCategories = (portfolio) => {
    const categories = [
      { category: "Ações", amount: 0 },
      { category: "FIIs", amount: 0 },
      { category: "Renda Fixa", amount: 0 },
    ];

    portfolio.stocks.forEach((stock) => {
      if (stock.type === "STOCK") {
        categories[0].amount += stock.currentValue;
      } else if (stock.type === "REIT") {
        categories[1].amount += stock.currentValue;
      }
    });

    portfolio.fixedIncome?.forEach((investment) => {
      categories[2].amount += investment.currentValue;
    });

    setInvestmentCategories(categories);
  };

  const chartData = [
    {
      x: investmentCategories.map((item) => item.category),
      y: investmentCategories.map((item) => item.amount),
      type: "bar",
      marker: { color: "#4285F4" },
    },
  ];

  const chartLayout = {
    title: "Distribuição de Investimentos",
    xaxis: {
      title: "Categorias",
      tickangle: -45,
      automargin: true,
    },
    yaxis: { title: "Valor (R$)" },
    margin: { l: 50, r: 40, t: 60, b: 80 },
    bargap: 0.2,
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

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Investido:</Text>
          <Text style={styles.summaryValue}>
            R${" "}
            {portfolioSummary.totalInvested.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Valor Atual:</Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color:
                  portfolioSummary.currentValue > portfolioSummary.totalInvested
                    ? "#1e8e3e"
                    : "#d93025",
              },
            ]}
          >
            R${" "}
            {portfolioSummary.currentValue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Rentabilidade:</Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color:
                  portfolioSummary.monthlyProfitability >= 0
                    ? "#1e8e3e"
                    : "#d93025",
              },
            ]}
          >
            {portfolioSummary.monthlyProfitability.toFixed(2)}%
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Distribuição de Investimentos</Text>
      <View style={styles.chartContainer}>
        <Plotly
          data={chartData}
          layout={chartLayout}
          style={styles.plotlyStyle}
          config={{ displayModeBar: false, staticPlot: true }}
        />
      </View>

      <Text style={styles.subtitle}>Ações Rápidas</Text>
      <View style={styles.actionsContainer}>
        <CustomButton
          title="Atualizar Dados"
          onPress={fetchPortfolioData}
          icon={<MaterialIcons name="refresh" size={24} color="white" />}
          style={styles.buttonSpacing}
        />
        <CustomButton
          title="Comprar ou Vender Ações"
          onPress={() => {}}
          icon={<FontAwesome name="exchange" size={24} color="white" />}
          style={styles.buttonSpacing}
        />
      </View>
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
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 20,
    width: "100%",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#555",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chartContainer: {
    width: screenWidth - 32,
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    padding: 10,
    marginBottom: 20,
  },
  plotlyStyle: {
    flex: 1,
    borderRadius: 8,
  },
  actionsContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonSpacing: {
    marginBottom: 16,
    width: "100%",
    maxWidth: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4285F4",
  },

  positiveValue: {
    color: "#1e8e3e",
  },
  negativeValue: {
    color: "#d93025",
  },
});
