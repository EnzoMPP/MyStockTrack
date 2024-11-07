import React, { useEffect, useContext } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import useLogout from "../hooks/useLogout";
import CustomButton from "../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "@env";
import { UserContext } from "../context/UserContext";

const PerfilScreen = () => {
  const { handleLogout } = useLogout();
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("🔍 Iniciando fetch de dados do usuário");
        const token = await AsyncStorage.getItem("token");
        console.log("🔑 Token obtido:", token);

        if (token) {
          const endpoint = `${BACKEND_URL}/perfil`;
          console.log(`📡 Enviando requisição para ${endpoint}`);

          const response = await axios.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("📥 Dados recebidos do backend:", response.data);

          setUser(response.data);
          console.log("👤 Usuário definido no contexto:", response.data);
        } else {
          console.log("❌ Nenhum token encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        console.log("⏳ Finalizando fetch de dados do usuário");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        </>
      ) : (
        <Text style={styles.errorText}>Usuário não encontrado.</Text>
      )}
      <CustomButton title="Logout" onPress={handleLogout} />
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
    marginBottom: 30,
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
});

export default PerfilScreen;
