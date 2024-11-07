import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
import useAuth from './src/hooks/useAuth';
import { UserProvider } from './src/context/UserContext';

function AuthHandler({ children }) {
  useAuth();
  return <>{children}</>;
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer ref={navigationRef}>
        <AuthHandler>
          <AppNavigator />
        </AuthHandler>
      </NavigationContainer>
    </UserProvider>
  );
}