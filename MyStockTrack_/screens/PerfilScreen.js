import { View, Text, StyleSheet, Button } from "react-native";


export default PerfilScreen = ({ navigation }) => {

    const HandleLogout = () => {
        navigation.navigate('Login');
    }
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