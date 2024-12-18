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
          // Se o aplicativo mudar de ativo para inativo ou em segundo plano, realiza o logout
          appStateRef.current.match(/active/) &&
          nextAppState.match(/inactive|background/)
        ) {
          await handleLogout(); 
        }
        appStateRef.current = nextAppState;// Atualiza a referência do estado atual do aplicativo
      }
    );

    const backHandler = BackHandler.addEventListener( // ação para o botão de voltar do android
      "hardwareBackPress",
      () => {
        // caso não seja a tela de login exibe um alerta para confirmar a saída do aplicativo
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
                BackHandler.exitApp();
              },
            },
          ]);
          return true;
        }
        return false;
      }
    );
// remove o evento quando o componente for desmontado
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
