import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import FavoriteStockItem from "./FavoriteStockItem";

// Definindo o componente FavoriteStockList que exibe a lista de ações favoritas
export default function FavoriteStockList({ stocks, onRemove }) {
  // Verifica se a lista de ações favoritas está vazia
  if (stocks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma ação favorita adicionada.</Text>
      </View>
    );
  }

  return (
    // Renderiza a lista de ações favoritas
    <FlatList
    //data recebe a lista de ações favoritas
      data={stocks}
      renderItem={({ item }) => (
        // Renderiza o componente FavoriteStockItem para cada ação favorita
        <FavoriteStockItem item={item} onRemove={onRemove} />
      )}
      keyExtractor={(item) => item.symbol} // Define a chave de cada item que é o símbolo da ação (symbol) extraidos do finnhub
      contentContainerStyle={styles.listContainer} 
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
  },
  listContainer: {
    padding: 10,
  },
});