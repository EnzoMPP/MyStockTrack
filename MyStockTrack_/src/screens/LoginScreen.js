import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import * as AuthSession from 'expo-auth-session';

const BACKEND_URL = 'https://8fe6-2804-14c-fc81-94aa-c594-8bca-84f0-1c66.ngrok-free.app';
const CLIENT_ID = '32000754721-7sloq4ak1ocbga6cl0i2b622pqpfdvhi.apps.googleusercontent.com';

const REDIRECT_URI = AuthSession.makeRedirectUri({});
console.log('REDIRECT_URI:', REDIRECT_URI);

const LoginScreen = () => {
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
