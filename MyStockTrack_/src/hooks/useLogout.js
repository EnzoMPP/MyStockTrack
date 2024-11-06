import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';
import { BACKEND_URL } from '@env';

export default function useLogout() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      console.log("📍 Iniciando o processo de logout");

      const token = await AsyncStorage.getItem('token');
      console.log("🔑 Token obtido:", token);

      if (!token) {
        console.log("❌ Nenhum token encontrado para revogação");
        navigation.navigate('Login');
        return;
      }

      // Revogar token no Google
      console.log("🔄 Revogando token no Google");
      try {
        await AuthSession.revokeAsync(
          { token },
          { revocationEndpoint: 'https://oauth2.googleapis.com/revoke' }
        );
        console.log("✅ Token Google revogado com sucesso");
      } catch (revokeError) {
        console.error("❌ Erro ao revogar token Google:", revokeError);
        // Continuar com o logout mesmo se falhar a revogação do Google
      }

      // Chamar backend para logout
      console.log("🔄 Chamando backend para logout");
      const response = await axios.post(
        `${BACKEND_URL}/logout`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      console.log("✅ Resposta do backend:", response.data);

      // Limpar storage local
      await AsyncStorage.removeItem('token');
      console.log("🗑️ Token removido do AsyncStorage");

      // Navegar para login
      navigation.navigate('Login');
      console.log("✅ Logout completo, navegando para Login");
    } catch (error) {
      console.error("❌ Erro no processo de logout:", error?.response?.data || error.message);
      
      // Mesmo com erro, tentar limpar dados locais
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    }
  };

  return { handleLogout };
}