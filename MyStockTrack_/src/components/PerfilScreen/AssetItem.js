import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const AssetItem = ({ asset, sellQuantity, onQuantityChange, onSell }) => {
  const investedValue = asset.quantity * asset.averagePrice;
// Definindo os campos dentro do Modal de Venda de Ações
  return (
    <View style={styles.container}>
      <View style={styles.assetInfo}>
        <Text style={styles.assetSymbol}>{asset.symbol}</Text>
        <Text>Quantidade: {asset.quantity}</Text>
        <Text>Valor Investido: $ {investedValue.toFixed(2)}</Text>
      </View>
      <View style={styles.sellContainer}>
        <TextInput
          style={styles.input}
          placeholder="Qtd"
          keyboardType="numeric"
          value={sellQuantity}
          onChangeText={onQuantityChange}
        />
        <TouchableOpacity style={styles.sellButton} onPress={onSell}>
          <Text style={styles.sellText}>Vender</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 15, 
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  assetInfo: {
    flex: 2,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sellContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  sellButton: {
    backgroundColor: "#EA4335",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  sellText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AssetItem;