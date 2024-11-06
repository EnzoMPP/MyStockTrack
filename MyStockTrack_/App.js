import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';
import { Alert } from 'react-native';
import { navigationRef, navigate } from './src/navigation/RootNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const { url } = event;
      console.log('Deep link recebido:', url);
      const parsed = Linking.parse(url);
      const { queryParams } = parsed;
      if (queryParams?.token) {
        console.log('Token recebido:', queryParams.token);

        // Salvar o token no AsyncStorage
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

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}