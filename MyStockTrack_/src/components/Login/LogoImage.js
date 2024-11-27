import React from "react";
import { Image, StyleSheet } from "react-native";

export default function LogoImage() {
  return (
    <Image
      source={require("../../../assets/images/logo.png")}
      style={styles.logo}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});