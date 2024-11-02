import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = '32000754721-cj937dbq11ssu3lek8poda9o0ui3tg92.apps.googleusercontent.com';
const REDIRECT_URI = 'https://auth.expo.io/@enzompp/MyStockTrack';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export default function LoginScreen({ navigation }) {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ['profile', 'email'],
      responseType: 'token',
    },
    { authorizationEndpoint: AUTH_URL, tokenEndpoint: TOKEN_URL }
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleGoogleLogin(access_token);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken) => {
    try {
      const response = await fetch('https://cd8d-2804-14c-fc81-94aa-c053-d6c3-744f-40de.ngrok-free.app/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: accessToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('userToken', data.token);
        Alert.alert('Login bem-sucedido!', `Bem-vindo, ${data.user.name}!`);
        navigation.navigate('AppTabs');
      } else {
        const errorData = await response.json();
        Alert.alert('Erro no login', errorData.message || 'Falha na autenticação.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Button
        title="Login com Google"
        disabled={!request}
        onPress={() => promptAsync()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 50,
  },
});