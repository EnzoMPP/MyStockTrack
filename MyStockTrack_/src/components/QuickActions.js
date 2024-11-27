import React from "react";
import { View, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton";
import { MaterialIcons } from "@expo/vector-icons";

export default function QuickActions({ onRefresh }) {
  return (
    <View style={styles.actionsContainer}>
      <CustomButton
        title="Atualizar Dados"
        onPress={onRefresh}
        icon={<MaterialIcons name="refresh" size={24} color="white" />} //pega o icone do material icons de refresh
        style={styles.buttonSpacing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    marginTop: 0,
    width: "100%",
    alignItems: "center",
  },
  buttonSpacing: {
    marginBottom: 16,
    width: "100%",
    maxWidth: 300,
  },
});