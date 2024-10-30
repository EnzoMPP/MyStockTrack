import React, { useState, useEffect } from 'react';
import { Text, Button, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomInput from '../components/CustomInput';
import { useFetchAddress } from '../hooks/useFetchAddress';
import { useSignupValidation } from '../hooks/useSignupValidation';
import { formatBirthDate, formatCep, formatPhone, formatCpf } from '../utils/formatters';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [cep, setCep] = useState('');

  const { address, fetchAddress, setAddress } = useFetchAddress();
  const { validateSignup } = useSignupValidation();

  useEffect(() => {
    if (cep.length === 9) {
      fetchAddress(cep.replace(/[^\d]+/g, ''));
    }
  }, [cep]);

  const handleSignup = async () => {
    const validatedData = await validateSignup({
      name,
      cpf,
      email,
      password,
      address,
      houseNumber,
      complement,
      phone,
      birthDate,
      gender,
      cep,
    });

    if (!validatedData) return;

    try {
      const response = await fetch('https://3c3e-187-32-126-53.ngrok-free.app/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
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
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tela de Cadastro</Text>
        <CustomInput
          placeholder="Nome Completo"
          value={name}
          onChangeText={setName}
        />
        <CustomInput
          placeholder="CEP"
          value={cep}
          onChangeText={(text) => setCep(formatCep(text))}
          onBlur={() => fetchAddress(cep.replace(/[^\d]+/g, ''))}
          keyboardType="numeric"
          maxLength={9} 
        />
        <CustomInput
          placeholder="Endereço"
          value={address}
          onChangeText={setAddress}
        />
        <CustomInput
          placeholder="Número da Casa"
          value={houseNumber}
          onChangeText={setHouseNumber}
          keyboardType="numeric"
          maxLength={6} 
        />
        <CustomInput
          placeholder="Complemento (opcional)"
          value={complement}
          onChangeText={setComplement}
        />
        <CustomInput
          placeholder="CPF"
          value={cpf}
          onChangeText={(text) => setCpf(formatCpf(text))}
          keyboardType="numeric"
          maxLength={14} 
        />
        <CustomInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <CustomInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <CustomInput
          placeholder="Data de Nascimento (dd/mm/aaaa)"
          value={birthDate}
          onChangeText={(text) => setBirthDate(formatBirthDate(text))}
          keyboardType="numeric"
          maxLength={10} 
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
        <CustomInput
          placeholder="Telefone"
          value={phone}
          onChangeText={(text) => setPhone(formatPhone(text))}
          keyboardType="phone-pad"
          maxLength={15} 
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