import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import AtivosScreen from '../screens/AtivosScreen';
import TransacoesScreen from '../screens/TransacoesScreen';
import DepositosScreen from '../screens/DepositosScreen';
import RentabilidadeScreen from '../screens/RentabilidadeScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import LoginScreen from '../screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AppTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Ativos" component={AtivosScreen} />
      <Tab.Screen name="Transações" component={TransacoesScreen} />
      <Tab.Screen name="Depósitos" component={DepositosScreen} />
      <Tab.Screen name="Rentabilidade" component={RentabilidadeScreen} />
      <Tab.Screen name="Histórico" component={HistoricoScreen} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AppTabs" component={AppTabs} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}