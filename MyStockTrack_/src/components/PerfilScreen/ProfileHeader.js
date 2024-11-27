import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ProfileHeader = ({ user, balance }) => {
  return (
    // Renderiza o cabeçalho do perfil
    <View style={styles.container}>
      <Image
        source={{ uri: `${user.profilePicture}?sz=400` }} // Exibe a imagem de perfil do usuário imagem pega da API do Google
        style={styles.profileImage}
        onError={(e) => console.error("❌ Erro ao carregar a imagem:", e.nativeEvent.error)} 
      />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.balance}>Saldo: $ {balance.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    marginBottom: 5,
    fontWeight: "bold",
  },
  email: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  balance: {
    fontSize: 18,
    color: "#333",
  },
});

export default ProfileHeader;