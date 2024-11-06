import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';

export default function useLogout() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      console.log("Iniciando o processo de logout");

      const token = await AsyncStorage.getItem('token');
      console.log("Token obtido:", token);

      if (token) {
        console.log("Revogando token no Google");
        await AuthSession.revokeAsync(
          { token },
          { revocationEndpoint: 'https://oauth2.googleapis.com/revoke' }
        );
        console.log("Token revogado com sucesso");
      } else {
        console.log("Nenhum token encontrado para revogação");
      }

      await AsyncStorage.removeItem('token');
      console.log("Token removido do AsyncStorage");

      navigation.navigate('Login');
      console.log("Navegando para a tela de Login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return { handleLogout };
}