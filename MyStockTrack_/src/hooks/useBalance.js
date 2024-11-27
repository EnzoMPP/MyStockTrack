
import { useState } from "react";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";

export const useBalance = () => {
  const [balance, setBalance] = useState(0); //inicia o saldo como zero

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/balance`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      // Atualiza o estado balance com o saldo recebido na resposta
      setBalance(response.data.balance);
    } catch (error) {
      
      console.error("Erro ao buscar saldo:", error);
      Alert.alert("Erro", "Não foi possível obter o saldo.");
    }
  };

  return {
    balance,
    fetchBalance,
    setBalance, 
  };
};