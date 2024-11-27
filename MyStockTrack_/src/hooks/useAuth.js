import { useEffect, useContext } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserContext } from "../context/UserContext";
// Importa o módulo Linking para lidar com deep link
import * as Linking from "expo-linking";
import { navigationRef } from "../navigation/RootNavigation";
import { BACKEND_URL } from "@env";

export default function useAuth() {
  const { setUser } = useContext(UserContext); 

  // UuseEffect para executar um efeito após a renderização do componente
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const { url } = event; 
      console.log("Deep link recebido:", url); 
      const parsed = Linking.parse(url); // Analisa a URL recebida
      const { queryParams } = parsed;
      if (queryParams?.token) { // Verifica se a URL contém um token
        console.log("Token recebido:", queryParams.token); // Loga o token recebido

        // Armazena o token no AsyncStorage
        await AsyncStorage.setItem("token", queryParams.token);
        console.log("Token salvo no AsyncStorage");
        Alert.alert("Login bem-sucedido!");
        if (navigationRef.isReady()) { 
          navigationRef.navigate("AppTabs"); // Navega para a tela "AppTabs"
        }

        try {
          // requisição d para obter os dados do perfil
          const response = await axios.get(`${BACKEND_URL}/profile`, {
            headers: {
              Authorization: `Bearer ${queryParams.token}`, 
            },
          });
          console.log("📥 Dados recebidos do backend:", response.data); 
          setUser(response.data);
          console.log("👤 Usuário definido no contexto:", response.data); 
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error); 
          Alert.alert("Erro ao buscar dados do usuário."); 
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    (async () => {
      const initialUrl = await Linking.getInitialURL(); // Obtém a URL inicial 
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    
    return () => {
      subscription.remove();
    };
  }, []); 
}