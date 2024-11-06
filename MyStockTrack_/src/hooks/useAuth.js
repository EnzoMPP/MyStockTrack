import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { navigate } from '../navigation/RootNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAuth() {
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const { url } = event;
      console.log('Deep link recebido:', url);
      const parsed = Linking.parse(url);
      const { queryParams } = parsed;
      if (queryParams?.token) {
        console.log('Token recebido:', queryParams.token);

        // Para Salvar o token no AsyncStorage
        await AsyncStorage.setItem('token', queryParams.token);
        console.log('Token salvo no AsyncStorage');

        Alert.alert('Login bem-sucedido!');
        navigate('AppTabs');
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