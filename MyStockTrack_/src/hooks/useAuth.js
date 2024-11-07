import { useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 
import { UserContext } from '../context/UserContext';
import * as Linking from 'expo-linking';
import { navigationRef } from '../navigation/RootNavigation'; 
import { BACKEND_URL } from '@env'; 

export default function useAuth() {
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const { url } = event;
      console.log('Deep link recebido:', url);
      const parsed = Linking.parse(url);
      const { queryParams } = parsed;
      if (queryParams?.token) {
        console.log('Token recebido:', queryParams.token);

        
        await AsyncStorage.setItem('token', queryParams.token);
        console.log('Token salvo no AsyncStorage');

        Alert.alert('Login bem-sucedido!');
        if (navigationRef.isReady()) {
          navigationRef.navigate('AppTabs');
        }

        
        try {
          const response = await axios.get(`${BACKEND_URL}/perfil`, {
            headers: {
              'Authorization': `Bearer ${queryParams.token}`,
            },
          });
          console.log('📥 Dados recebidos do backend:', response.data);
          setUser(response.data); 
          console.log('👤 Usuário definido no contexto:', response.data);
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          Alert.alert('Erro ao buscar dados do usuário.');
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    return () => {
      subscription.remove();
    };
  }, []);
}