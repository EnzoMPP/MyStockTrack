import React, { useContext } from "react";
import { Image, View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import TransacoesScreen from "../screens/TransacoesScreen";
import DepositosScreen from "../screens/DepositosScreen";
import FavoritosScreen from "../screens/FavoritosScreen";
import PerfilScreen from "../screens/PerfilScreen";
import LoginScreen from "../screens/LoginScreen";
import { UserContext } from "../context/UserContext";
import MercadoScreen from "../screens/MercadoScreen";
import { FavoritesProvider } from "../context/FavoritesContext";


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AppTabs() {
  const { user } = useContext(UserContext);

  return (
    <FavoritesProvider>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarActiveTintColor: "#4285F4",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <Image
                source={require("../../assets/icons/home.png")}
                style={{ width: size, height: size }}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Mercado"
        component={MercadoScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Image
                source={require("../../assets/icons/market.png")}
                style={{ width: size, height: size }}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Transações"
        component={TransacoesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <Image
                source={require("../../assets/icons/transacoes.png")}
                style={{ width: size, height: size }}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Depósitos"
        component={DepositosScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <Image
                source={require("../../assets/icons/depositos.png")}
                style={{ width: size, height: size }}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={
                focused ? styles.iconContainerActive : styles.iconContainer
              }
            >
              <Image
                source={require("../../assets/icons/favoritos.png")}
                style={{ width: size, height: size }}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) =>
            user && user.profilePicture ? (
              <View
                style={
                  focused ? styles.iconContainerActive : styles.iconContainer
                }
              >
                <Image
                  source={{ uri: `${user.profilePicture}?sz=100` }}
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                  }}
                />
              </View>
            ) : (
              <View
                style={
                  focused ? styles.iconContainerActive : styles.iconContainer
                }
              >
                <Image
                  source={require("../../assets/icons/profile.png")}
                  style={{ width: size, height: size }}
                />
              </View>
            ),
        }}
      />
    </Tab.Navigator>
    </FavoritesProvider>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerActive: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4285F4",
    borderRadius: 25,
    padding: 4,
  },
});
