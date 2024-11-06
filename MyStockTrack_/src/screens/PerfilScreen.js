import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilScreen({ navigation }) {

    const HandleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userSession');

            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('password');

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