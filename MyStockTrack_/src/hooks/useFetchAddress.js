import { useState } from 'react';
import { Alert } from 'react-native';

export const useFetchAddress = () => {
  const [address, setAddress] = useState('');

  const fetchAddress = async (cep) => {
    console.log(`Fetching address for CEP: ${cep}`);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado.');
        return;
      }
      console.log(`Address fetched: ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
      setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
    } catch (error) {
      console.error('Erro ao buscar o endereço:', error.message);
      Alert.alert('Erro', 'Não foi possível buscar o endereço. Verifique sua conexão.');
    }
  };

  return { address, fetchAddress, setAddress };
};