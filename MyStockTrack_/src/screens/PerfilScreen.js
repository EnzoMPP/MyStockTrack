import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useLogout from '../hooks/useLogout';
import CustomButton from '../components/CustomButton';

const PerfilScreen = () => {
  const { handleLogout } = useLogout();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <CustomButton title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default PerfilScreen;