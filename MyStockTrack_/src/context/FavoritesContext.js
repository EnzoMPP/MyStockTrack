import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import axios from 'axios'; 
import { BACKEND_URL } from '@env'; 
import { Alert } from 'react-native'; 


export const FavoritesContext = createContext();

// esse component ira envolver outros para criar o contexto de favoritos
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]); //define o array de favoritos
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

    // requisição GET para obter os favoritos do backend
      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` }, 
      });

      // Pega os nomes das ações favoritas da resposta
      const favoriteSymbols = response.data.stocks.map(stock => stock.symbol);
      setFavorites(favoriteSymbols);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      Alert.alert('Erro', 'Falha ao buscar favoritos.');
    } finally {
      // Parar de carregar falhando ou não, bloco finally
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []); // efeito só vai executar uma vez, quando o componente monta

  const addFavorite = async (symbol) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        //erro de jwt
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        return;
      }

      //requisição POST para lançar o nome dos favoritos pro backend
      await axios.post(
        `${BACKEND_URL}/api/favorites`,
        { symbol }, 
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      // acrescentar no array como visto em aula
      setFavorites(prev => [...prev, symbol]);

      Alert.alert('Sucesso', 'Ação adicionada aos favoritos.');
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      const message = error.response?.data?.message || 'Falha ao adicionar favorito.';
      Alert.alert('Erro', message);
    }
  };

  // Para remover um símbolo dos favoritos:
  const removeFavorite = async (symbol) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        return;
      }

      //requisição DELETE remove dos favoritos
      await axios.delete(`${BACKEND_URL}/api/favorites/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }, // Cabeçalho da requisição com o token
      });

      // Atualiza o estado favorites removendo o símbolo
      setFavorites(prev => prev.filter(item => item !== symbol)); //filtrar o array de favoritos PASSA TUDO QUE FOR DIFERENTE DE SYMBOL
      Alert.alert('Sucesso', 'Ação removida dos favoritos.');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      const message = error.response?.data?.message || 'Falha ao remover favorito.';
      Alert.alert('Erro', message);
    }
  };

  // Retorna o contexto com os valores e funções para os componentes filhos{CHILDREN}
  return (
    <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};