import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [cep, setCep] = useState('');

  const handleSignup = async () => {
    if (name && cpf && email && password && address && phone && birthDate && gender && cep) {
      const cleanCpf = cpf.replace(/[^\d]+/g, '');
      const cleanCep = cep.replace(/[^\d]+/g, '');
  
      try {
        const response = await fetch('https://472f-2804-14c-fc81-94aa-2847-ab19-def8-c887.ngrok-free.app/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            cpf: cleanCpf,
            email,
            password,
            address,
            phone,
            birthDate,
            gender,
            cep: cleanCep,
          }),
        });
  
        const responseText = await response.text();
      
  
        if (response.ok) {
          const data = JSON.parse(responseText);
          Alert.alert('Cadastro bem-sucedido!', `Bem-vindo, ${name}!`);
          navigation.navigate('Login');
        } else {
          const errorMessage = responseText || 'Erro ao cadastrar usuário.';
          Alert.alert('Erro no cadastro', errorMessage);
        }
      } catch (error) {
        console.error('Erro ao conectar ao servidor:', error.message);
        Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    } else {
      Alert.alert('Erro no cadastro', 'Por favor, preencha todos os campos.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tela de Cadastro</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Endereço"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Data de Nascimento (dd/mm/aaaa)"
          value={birthDate}
          onChangeText={setBirthDate}
        />
        <Picker
          selectedValue={gender}
          style={styles.input}
          onValueChange={(itemValue) => setGender(itemValue)}
        >
          <Picker.Item label="Selecione o Gênero" value="" />
          <Picker.Item label="Masculino" value="masculino" />
          <Picker.Item label="Feminino" value="feminino" />
          <Picker.Item label="Outro" value="outro" />
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="CEP"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
        />
        <Button title="Cadastrar" onPress={handleSignup} />
        <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>
          Já tem uma conta? Faça login
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  loginText: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
