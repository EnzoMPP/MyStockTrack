import React, { useState } from "react";
import { View, Text, TextInput, Button, Modal, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { BACKEND_URL } from "@env";

export const BuyModal = ({ visible, stock, onClose, styles, fetchStocks, setBalance }) => {
  const [quantity, setQuantity] = useState("");

  const buyStock = async () => {
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      Alert.alert("Erro", "Por favor, insira uma quantidade válida.");
      return;
    }

    if (!stock) {
      Alert.alert("Erro", "Ação selecionada não encontrada.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/transactions/buy`,
        {
          symbol: stock.symbol,
          assetName: stock.companyName,
          quantity: parseInt(quantity),
          price: stock.currentPrice,
          assetType: "STOCK",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Sucesso", "Ação comprada com sucesso!");
      setBalance(response.data.balance);
      onClose();
      setQuantity("");
      fetchStocks();
    } catch (error) {
      Alert.alert("Erro", error.response?.data?.message || "Falha ao comprar a ação.");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        onClose();
        setQuantity("");
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Comprar Ação</Text>
          <Text style={styles.modalSymbol}>{stock?.symbol}</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <View style={styles.modalButtons}>
            <Button
              title="Cancelar"
              onPress={() => {
                onClose();
                setQuantity("");
              }}
            />
            <Button title="Comprar" onPress={buyStock} />
          </View>
        </View>
      </View>
    </Modal>
  );
};