import React, { useEffect } from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';

const BACKEND_URL = 'https://8fe6-2804-14c-fc81-94aa-c594-8bca-84f0-1c66.ngrok-free.app';
const CLIENT_ID = '32000754721-7sloq4ak1ocbga6cl0i2b622pqpfdvhi.apps.googleusercontent.com';

const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'mystocktrack',
});
console.log(REDIRECT_URI);

const LoginScreen = ({ navigation }) => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['profile', 'email'],
      redirectUri: REDIRECT_URI,
      responseType: 'code',
    },
    {
      authorizationEndpoint: `${BACKEND_URL}/auth/google`,
    }
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params?.code) {
      const { code } = response.params;
      axios
        .get(`${BACKEND_URL}/auth/google/callback`, {
          params: { code },
        })
        .then((apiResponse) => {
          Alert.alert('Login bem-sucedido!');
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
          promptAsync();
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