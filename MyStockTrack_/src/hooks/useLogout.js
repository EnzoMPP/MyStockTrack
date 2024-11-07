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

      console.log("🔄 Revogando token no Google");
      try {
        await AuthSession.revokeAsync(
          { token },
          { revocationEndpoint: 'https://oauth2.googleapis.com/revoke' }
        );
        console.log("✅ Token Google revogado com sucesso");
      } catch (revokeError) {
        console.error("❌ Erro ao revogar token Google:", revokeError);
      }

      console.log("🔄 Chamando backend para logout");
      try {
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
      } catch (backendError) {
        console.error("❌ Erro ao chamar backend para logout:", backendError);
      }

      await AsyncStorage.removeItem('token');
      console.log("🗑️ Token removido do AsyncStorage");

      navigation.navigate('Login');
      console.log("✅ Logout completo, navegando para Login");
    } catch (error) {
      console.error("❌ Erro no processo de logout:", error?.response?.data || error.message);

      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    }
  };

  return { handleLogout };
}
