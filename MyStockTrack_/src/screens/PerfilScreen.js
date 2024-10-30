import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilScreen({ navigation }) {

    const HandleLogout = async () => {
        try {
            // Remove o token e dados de sessão armazenados
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userSession');

            // Remove os valores dos campos de login armazenados
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('password');

            // Navega para a tela de Login após limpar os dados de sessão
            navigation.navigate('Login');
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Perfil Screen</Text>
            <Button title="Logout" onPress={HandleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});