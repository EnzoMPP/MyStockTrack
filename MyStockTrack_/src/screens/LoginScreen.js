import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { BACKEND_URL, GOOGLE_CLIENT_ID } from '@env';

const REDIRECT_URI = AuthSession.makeRedirectUri();

const LoginScreen = () => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
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