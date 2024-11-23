import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
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
      if (
        isNaN(quantityNum) ||
        quantityNum <= 0 ||
        quantityNum > asset.quantity
      ) {
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

  const handleShowAssets = async () => {
    setLoading(true);
    try {
      await fetchPortfolio();
      await fetchBalance();
      setShowAssets(true);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      Alert.alert("Erro", "Falha ao atualizar dados do portfólio.");
    } finally {
      setLoading(false);
    }
  };

  const renderAssetItem = ({ item }) => (
    <View style={styles.assetItem}>
      <View style={styles.assetInfo}>
        <Text style={styles.assetSymbol}>{item.symbol}</Text>
        <Text>Quantidade: {item.quantity}</Text>
        <Text>Preço Médio: $ {item.averagePrice.toFixed(2)}</Text>
        <Text>Preço Atual: $ {item.currentPrice.toFixed(2)}</Text>
        <Text>Valor Atual: $ {item.currentValue.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Quantidade a vender"
          keyboardType="numeric"
          value={quantities[item.symbol] || ""}
          onChangeText={(text) => {
            setQuantities((prev) => ({
              ...prev,
              [item.symbol]: text,
            }));
          }}
        />
      </View>
      <TouchableOpacity
        style={styles.sellButton}
        onPress={() => handleSell(item)}
      >
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
            onError={(e) =>
              console.error(
                "❌ Erro ao carregar a imagem:",
                e.nativeEvent.error
              )
            }
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.balance}>Saldo: $ {balance.toFixed(2)}</Text>
        </>
      ) : (
        <Text style={styles.errorText}>Usuário não encontrado.</Text>
      )}

      <View style={styles.portfolioContainer}>
        <Text style={styles.portfolioTitle}>Resumo do Portfólio</Text>
        {portfolio && (
          <>
            <Text>
              Total Investido: $ {portfolio.totalInvested.toFixed(2)}
            </Text>
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

      <Button title="Minhas Ações" onPress={handleShowAssets} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAssets}
        onRequestClose={() => setShowAssets(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ações Compradas</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#4285F4" />
            ) : portfolio?.assets?.length > 0 ? (
              <FlatList
                data={portfolio.assets}
                keyExtractor={(item) => item.symbol}
                renderItem={renderAssetItem}
                style={styles.assetsList}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                removeClippedSubviews={false}
              />
            ) : (
              <Text>Nenhuma ação comprada.</Text>
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
    maxHeight: "80%", 
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
  },
  assetsList: {
    width: "100%",
    marginVertical: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#EA4335",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButtonContainer: {
    marginTop: 20,
    width: "100%",
  },
});

export default PerfilScreen;
