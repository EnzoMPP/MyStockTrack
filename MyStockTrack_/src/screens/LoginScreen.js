import React, { useEffect } from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';

const BACKEND_URL = 'https://27bb-2804-14c-fc81-94aa-3ddf-c819-ac30-bac4.ngrok-free.app'; 
const CLIENT_ID = '32000754721-7sloq4ak1ocbga6cl0i2b622pqpfdvhi.apps.googleusercontent.com';

const REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: true,
});

console.log('REDIRECT_URI:', REDIRECT_URI);

const LoginScreen = ({ navigation }) => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scopes: ['profile', 'email'],
      responseType: 'code',
    },
    {
      authorizationEndpoint: `${BACKEND_URL}/auth/google`,
    }
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      axios
        .get(`${BACKEND_URL}/auth/google/callback`, {
          params: { code, client_id: CLIENT_ID, redirect_uri: REDIRECT_URI },
        })
        .then((apiResponse) => {
          Alert.alert('Login bem-sucedido!', JSON.stringify(apiResponse.data));
          navigation.navigate('AppTabs');
        })
        .catch((error) => {
          console.error(error);
          Alert.alert('Erro no login', 'Não foi possível autenticar com o Google.');
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Button
        title="Login com Google"
        onPress={() => {
          promptAsync({ useProxy: true });
        }}
        disabled={!request}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LoginScreen;