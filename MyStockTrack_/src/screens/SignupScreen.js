import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomInput from '../components/CustomInput';
import { formatBirthDate, formatCep, formatPhone, formatCpf } from '../utils/formatters';
import { useEmailValidation } from '../hooks/useEmailValidation';
import { useFetchAddress } from '../hooks/useFetchAddress';

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

  const { isValid, validateEmail } = useEmailValidation();
  const { address, fetchAddress, setAddress } = useFetchAddress();

  useEffect(() => {
    if (cep.length === 9) {
      fetchAddress(cep.replace(/[^\d]+/g, ''));
    }
  }, [cep]);

  const handleSignup = async () => {
    if (name && cpf && email && password && address && houseNumber && phone && birthDate && gender && cep) {
      if (!await validateEmail(email)) {
        Alert.alert('Erro no cadastro', 'Por favor, insira um e-mail válido.');
        return;
      }

      try {
        const response = await fetch('https://06a0-2804-14c-fc81-94aa-2847-ab19-def8-c887.ngrok-free.app/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
      Alert.alert('Erro no cadastro', 'Por favor, preencha todos os campos obrigatórios.');
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
          keyboardType="numeric"
          maxLength={9} // Limita o número de caracteres no campo de entrada
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
          maxLength={14} // Limita o número de caracteres no campo de entrada
        />
        <CustomInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <CustomInput
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <CustomInput
          placeholder="Data de Nascimento (dd/mm/aaaa)"
          value={birthDate}
          onChangeText={(text) => setBirthDate(formatBirthDate(text))}
          keyboardType="numeric"
          maxLength={10} // Limita o número de caracteres no campo de entrada
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
          maxLength={15} // Limita o número de caracteres no campo de entrada
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