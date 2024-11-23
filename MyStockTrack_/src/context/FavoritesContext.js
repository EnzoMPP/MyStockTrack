// FavoritesContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import axios from 'axios';
import { BACKEND_URL } from '@env';
import { Alert } from 'react-native';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const favoriteSymbols = response.data.stocks.map(stock => stock.symbol);
      setFavorites(favoriteSymbols);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      Alert.alert('Erro', 'Falha ao buscar favoritos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const addFavorite = async (symbol) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        return;
      }

      await axios.post(
        `${BACKEND_URL}/api/favorites`,
        { symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavorites(prev => [...prev, symbol]);
      Alert.alert('Sucesso', 'Ação adicionada aos favoritos.');
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      const message = error.response?.data?.message || 'Falha ao adicionar favorito.';
      Alert.alert('Erro', message);
    }
  };

  const removeFavorite = async (symbol) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Token de autenticação não encontrado.');
        return;
      }

      await axios.delete(`${BACKEND_URL}/api/favorites/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites(prev => prev.filter(item => item !== symbol));
      Alert.alert('Sucesso', 'Ação removida dos favoritos.');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      const message = error.response?.data?.message || 'Falha ao remover favorito.';
      Alert.alert('Erro', message);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};