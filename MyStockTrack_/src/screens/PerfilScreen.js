import React, { useEffect, useContext, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, FlatList, TouchableOpacity, Alert, TextInput, Button, Modal } from "react-native";
import useLogout from "../hooks/useLogout";
import CustomButton from "../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "@env";
import { UserContext } from "../context/UserContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const PerfilScreen = () => {
  const { handleLogout } = useLogout();
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showAssets, setShowAssets] = useState(false);
  const [quantityToSell, setQuantityToSell] = useState("");

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
      console.log("Portfólio carregado:", response.data);
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
    Alert.alert(
      "Confirmar Venda",
      `Deseja vender ${quantityToSell} ${asset.symbol}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Vender", onPress: () => executeSell(asset) },
      ]
    );
  };

  const executeSell = async (asset) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const quantity = Number(quantityToSell);
      if (isNaN(quantity) || quantity <= 0 || quantity > asset.quantity) {
        Alert.alert("Erro", "Quantidade inválida.");
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/transactions/sell`,
        { symbol: asset.symbol, quantity, price: asset.currentPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sucesso", "Ação vendida com sucesso!");
      await fetchPortfolio();
      await fetchBalance();
      setQuantityToSell("");
    } catch (error) {
      console.error("Erro ao vender ação:", error);
      Alert.alert("Erro", error.response?.data?.message || "Falha ao vender ação.");
    }
  };

  const renderAssetItem = ({ item }) => (
    <View style={styles.assetItem}>
      <View style={styles.assetInfo}>
        <Text style={styles.assetSymbol}>{item.symbol}</Text>
        <Text>Quantidade: {item.quantity}</Text>
        <Text>Preço Médio: R$ {item.averagePrice.toFixed(2)}</Text>
        <Text>Preço Atual: R$ {item.currentPrice.toFixed(2)}</Text>
        <Text>Valor Atual: R$ {item.currentValue.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Quantidade a vender"
          keyboardType="numeric"
          value={quantityToSell}
          onChangeText={setQuantityToSell}
        />
      </View>
      <TouchableOpacity style={styles.sellButton} onPress={() => handleSell(item)}>
        <Text style={styles.sellButtonText}>Vender</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading || portfolioLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={24} color="white" />
      </TouchableOpacity>
      {user ? (
        <>
          <Image
            source={{ uri: `${user.profilePicture}?sz=400` }}
            style={styles.profileImage}
            onError={(e) => console.error("❌ Erro ao carregar a imagem:", e.nativeEvent.error)}
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.balance}>Saldo: R$ {balance.toFixed(2)}</Text>
        </>
      ) : (
        <Text style={styles.errorText}>Usuário não encontrado.</Text>
      )}

      <View style={styles.portfolioContainer}>
        <Text style={styles.portfolioTitle}>Resumo do Portfólio</Text>
        {portfolio && (
          <>
            <Text>Total Investido: R$ {portfolio.totalInvested.toFixed(2)}</Text>
            <Text>Valor Atual: R$ {portfolio.currentValue.toFixed(2)}</Text>
            <Text>
              Rentabilidade:{" "}
              <Text style={{ color: portfolio.monthlyProfitability >= 0 ? "#34A853" : "#EA4335" }}>
                {portfolio.monthlyProfitability.toFixed(2)}%
              </Text>
            </Text>
          </>
        )}
      </View>

      <Button title="Minhas Ações" onPress={() => setShowAssets(true)} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAssets}
        onRequestClose={() => setShowAssets(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ações Compradas</Text>
            {portfolio && portfolio.assets.length === 0 ? (
              <Text>Nenhuma ação comprada.</Text>
            ) : (
              <FlatList
                data={portfolio.assets}
                keyExtractor={(item) => item.symbol}
                renderItem={renderAssetItem}
              />
            )}
            <View style={styles.modalButtonContainer}>
              <Button title="Fechar" onPress={() => setShowAssets(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
  },
  email: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  balance: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
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
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  portfolioTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  assetsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  assetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  assetInfo: {
    flex: 1,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  sellButton: {
    backgroundColor: "#EA4335",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  sellButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#EA4335",
    padding: 10,
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
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
  modalButtonContainer: {
    marginTop: 20,
  },
});

export default PerfilScreen;