import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import axios from "axios";
import { BACKEND_URL } from "@env";
import { Alert } from "react-native";

export default function useLogout() {

  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      console.log("📍 Iniciando o processo de logout");

      // Pega o token armazenado no AsyncStorage
      const token = await AsyncStorage.getItem("token");
      console.log("🔑 Token obtido:", token);

      // confere  se o token existe
      if (!token) {
        console.log("❌ Nenhum token encontrado para revogação");
        Alert.alert("Logout", "Nenhum token encontrado. Redirecionando para login.");
        navigation.navigate("Login");
        return;
      }

      console.log("🔄 Revogando token no Google");
      try {
        // Revoga o token no Google
        await AuthSession.revokeAsync(
          { token },
          { revocationEndpoint: "https://oauth2.googleapis.com/revoke" }
        );
        console.log("✅ Token Google revogado com sucesso");
      } catch (revokeError) {
        console.error("❌ Erro ao revogar token Google:", revokeError);
        Alert.alert("Erro", "Falha ao revogar token no Google.");
      }

      console.log("🔄 Chamando backend para logout");
      try {
        //  POST no endpoint de logout 
        const response = await axios.post(
          `${BACKEND_URL}/auth/logout`, 
          {}, 
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
            withCredentials: true, 
          }
        );
        console.log("✅ Resposta do backend:", response.data);
      } catch (backendError) {
        console.error("❌ Erro ao chamar backend para logout:", backendError);
        Alert.alert("Erro", "Falha ao comunicar com o servidor durante o logout.");
      }

      // Joga fora  o token de autenticação do AsyncStorage
      await AsyncStorage.removeItem("token");
      console.log("🗑️ Token removido do AsyncStorage");

      // Vai para a tela de Login
      navigation.navigate("Login");
      console.log("✅ Logout completo, navegando para Login");
    } catch (error) {
      console.error(
        "❌ Erro no processo de logout:",
        error?.response?.data || error.message 
      );

      // se der erro remove do async storage e navega para login
      await AsyncStorage.removeItem("token");
      navigation.navigate("Login");
    }
  };

  return { handleLogout };
}