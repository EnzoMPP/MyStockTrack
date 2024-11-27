import React from "react";
import { StyleSheet, View } from "react-native";
import useAuthRequest from "../hooks/useAuthRequest";
import LoginButton from "../components/Login/LoginButton";
import LogoImage from "../components/Login/LogoImage";

const LoginScreen = () => {
  const { request, promptAsync } = useAuthRequest();

  return (
    <View style={styles.container}>
      <LogoImage />
      <LoginButton
        onPress={() => promptAsync()}
        disabled={!request}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

export default LoginScreen;