import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import FavoriteStockItem from "./FavoriteStockItem";

export default function FavoriteStockList({ stocks, onRemove }) {
  if (stocks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma ação favorita adicionada.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={stocks}
      renderItem={({ item }) => (
        <FavoriteStockItem item={item} onRemove={onRemove} />
      )}
      keyExtractor={(item) => item.symbol}
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