import React from "react";
import { BackHandler, Alert, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { navigationRef } from "./src/navigation/RootNavigation";
import useAuth from "./src/hooks/useAuth";
import { UserProvider } from "./src/context/UserContext";
import useLogout from "./src/hooks/useLogout";

function AuthHandler({ children }) {
  useAuth();
  const { handleLogout } = useLogout();
  const appStateRef = React.useRef(AppState.currentState);

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appStateRef.current.match(/active/) &&
          nextAppState.match(/inactive|background/)
        ) {
          await handleLogout();
        }
        appStateRef.current = nextAppState;
      }
    );

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (navigationRef.getCurrentRoute()?.name !== "Login") {
          Alert.alert("Sair do aplicativo", "Deseja realmente sair?", [
            {
              text: "Cancelar",
              onPress: () => null,
              style: "cancel",
            },
            {
              text: "Sim",
              onPress: async () => {
                await handleLogout();
                BackHandler.exitApp();
              },
            },
          ]);
          return true;
        }
        return false;
      }
    );

    return () => {
      subscription.remove();
      backHandler.remove();
    };
  }, [handleLogout]);

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
//ngrok http --url=modest-moderately-tapir.ngrok-free.app 3000