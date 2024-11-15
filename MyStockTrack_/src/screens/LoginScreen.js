import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Fontisto } from '@expo/vector-icons';
import useAuthRequest from "../hooks/useAuthRequest";
import CustomButton from "../components/CustomButton";

const LoginScreen = () => {
  const { request, promptAsync } = useAuthRequest();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />
      <CustomButton
        icon={<Fontisto name="google" size={24} color="white" />}
        title="Login com Google"
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
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
    resizeMode: "contain",
  },
});

export default LoginScreen;

