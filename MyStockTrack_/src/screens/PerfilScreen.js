
import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import useLogout from "../hooks/useLogout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "@env";
import { UserContext } from "../context/UserContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ProfileHeader from "../components/PerfilScreen/ProfileHeader";
import SellModal from "../components/PerfilScreen/SellModal";

const PerfilScreen = () => {
  const { handleLogout } = useLogout();
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showAssets, setShowAssets] = useState(false);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserData();
      await fetchPortfolio();
      await fetchBalance();
    };
    fetchData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const response = await axios.get(`${BACKEND_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } else {
        console.log("❌ Nenhum token encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      Alert.alert("Erro", "Falha ao buscar dados do usuário.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPortfolio(response.data);
    } catch (error) {
      console.error("Erro ao buscar portfólio:", error);
      Alert.alert("Erro", "Falha ao buscar portfólio.");
    } finally {
      setPortfolioLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBalance(response.data.balance);
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
      Alert.alert("Erro", "Falha ao buscar saldo.");
    }
  };

  const handleSell = (asset) => {
    const quantityToSell = quantities[asset.symbol];
    if (!quantityToSell) {
      Alert.alert("Erro", "Por favor, insira uma quantidade para vender.");
      return;
    }

    Alert.alert(
      "Confirmar Venda",
      `Deseja vender ${quantityToSell} ${asset.symbol}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Vender",
          onPress: () => executeSell(asset, quantityToSell),
        },
      ]
    );
  };

  const executeSell = async (asset, quantity) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const quantityNum = Number(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0 || quantityNum > asset.quantity) {
        Alert.alert("Erro", "Quantidade inválida.");
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/transactions/sell`,
        {
          symbol: asset.symbol,
          quantity: quantityNum,
          price: asset.currentPrice,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sucesso", "Ação vendida com sucesso!");
      setQuantities((prev) => ({
        ...prev,
        [asset.symbol]: "",
      }));
      await fetchPortfolio();
      await fetchBalance();
    } catch (error) {
      console.error("Erro ao vender ação:", error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Falha ao vender ação."
      );
    }
  };

  const handleShowAssets = () => {
    setShowAssets(true);
  };

  if (loading || portfolioLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão de Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="white" />
      </TouchableOpacity>

      {/* Cabeçalho do Perfil */}
      {user ? (
        <ProfileHeader user={user} balance={balance} />
      ) : (
        <Text style={styles.errorText}>Usuário não encontrado.</Text>
      )}

      {/* Resumo do Portfólio */}
      <View style={styles.portfolioContainer}>
        <Text style={styles.portfolioTitle}>Resumo do Portfólio</Text>
        {portfolio && (
          <>
            <Text>Total Investido: $ {portfolio.totalInvested.toFixed(2)}</Text>
            <Text>Valor Atual: $ {portfolio.currentValue.toFixed(2)}</Text>
            <Text>
              Rentabilidade:{" "}
              <Text
                style={{
                  color:
                    portfolio.monthlyProfitability >= 0 ? "#34A853" : "#EA4335",
                }}
              >
                {portfolio.monthlyProfitability.toFixed(2)}%
              </Text>
            </Text>
          </>
        )}
      </View>

      {/* Botão para Gerenciar Ações */}
      <View style={styles.buttonContainer}>
        <Button title="Gerenciar Ações" onPress={handleShowAssets} />
      </View>

      {/* Modal de Gerenciamento de Ações */}
      <SellModal
        visible={showAssets}
        onClose={() => setShowAssets(false)}
        assets={portfolio?.assets}
        quantities={quantities}
        setQuantities={setQuantities}
        handleSell={handleSell}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center", 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4285F4",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginBottom: 30,
  },
  portfolioContainer: {
    width: "80%", 
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center", 
  },
  portfolioTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#EA4335",
    padding: 10,
    borderRadius: 20,
  },
  buttonContainer: {
    width: "80%", 
    marginBottom: 20,
  },
});

export default PerfilScreen;