import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

// Definindo o componente CustomButton
const CustomButton = ({ title, onPress, disabled, icon, style }) => (
  <TouchableOpacity
    style={[
      styles.button,
      //a style buttonDisabled é aplicada quando o botão está desabilitado
      disabled && styles.buttonDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
  >{/* Definindo o conteúdo do botão */}
    <View style={styles.buttonContent}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.buttonText}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  buttonDisabled: {
    backgroundColor: "#A0C3F5",
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 8, 
  },
  iconContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default CustomButton;