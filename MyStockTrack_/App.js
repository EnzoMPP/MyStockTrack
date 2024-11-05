import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';
import axios from 'axios';
import { Alert } from 'react-native';
import { navigationRef, navigate } from './src/navigation/RootNavigation';

const BACKEND_URL = process.env.backendUrl || 'https://8fe6-2804-14c-fc81-94aa-c594-8bca-84f0-1c66.ngrok-free.app';

export default function App() {
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const { url } = event;
      console.log('Deep link recebido:', url);
      const parsed = Linking.parse(url);
      const { queryParams } = parsed;
      if (queryParams?.token) {
        console.log('Token recebido:', queryParams.token);

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
