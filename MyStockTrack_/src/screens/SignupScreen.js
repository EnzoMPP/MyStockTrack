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
      if (!await validateEmail(email)) {
        Alert.alert('Erro no cadastro', 'Por favor, insira um e-mail válido.');
        return;
      }

      const cleanCpf = cpf.replace(/[^\d]+/g, '');
      const cleanCep = cep.replace(/[^\d]+/g, '');
  
      try {
        const response = await fetch('https://06a0-2804-14c-fc81-94aa-2847-ab19-def8-c887.ngrok-free.app/signup', {
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

  const validateEmail = async (email) => {
    try {
      const response = await fetch(`https://api.zerobounce.net/v2/validate?api_key=2384ca236dc44f2bbab9dc075b40185f&email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      return data.status === 'valid';
    } catch (error) {
      console.error('Erro ao verificar o e-mail:', error.message);
      return false;
    }
  };

  const formatBirthDate = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
    }
    return cleaned.slice(0, 10); 
  };

  const formatCep = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5, 8);
    } else {
      cleaned = cleaned.slice(0, 8);
    }
    return cleaned;
  };

  const formatPhone = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    let formatted = '';

    if (cleaned.length > 0) {
      formatted += '(' + cleaned.slice(0, 2);
    }
    if (cleaned.length >= 3) {
      formatted += ') ' + cleaned.slice(2, 7);
    }
    if (cleaned.length >= 8) {
      formatted += '-' + cleaned.slice(7, 11);
    }

    return formatted;
  };

  const formatCpf = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    let formatted = '';

    if (cleaned.length > 0) {
      formatted += cleaned.slice(0, 3);
    }
    if (cleaned.length >= 4) {
      formatted += '.' + cleaned.slice(3, 6);
    }
    if (cleaned.length >= 7) {
      formatted += '.' + cleaned.slice(6, 9);
    }
    if (cleaned.length >= 10) {
      formatted += '-' + cleaned.slice(9, 11);
    }

    return formatted;
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
          onChangeText={(text) => setCpf(formatCpf(text))}
          keyboardType="numeric"
          maxLength={14} 
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
          onChangeText={(text) => setPhone(formatPhone(text))}
          keyboardType="phone-pad"
          maxLength={15}
        />
        <TextInput
          style={styles.input}
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
        <TextInput
          style={styles.input}
          placeholder="CEP"
          value={cep}
          onChangeText={(text) => setCep(formatCep(text))}
          keyboardType="numeric"
          maxLength={9} 
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