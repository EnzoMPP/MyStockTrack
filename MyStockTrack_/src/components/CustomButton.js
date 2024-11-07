import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomButton = ({ title, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#A0C3F5",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CustomButton;
