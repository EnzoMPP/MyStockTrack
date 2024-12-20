import React from "react";
import { FlatList, Text, View } from "react-native";
import TransactionItem from "./TransactionItem";

export default function TransactionList({ transactions }) {
  return (
    <FlatList
      data={transactions} // Recebe a lista de transações
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <TransactionItem item={item} />} 
      ListEmptyComponent={<Text>Nenhuma transação encontrada.</Text>} // Exibe a mensagem
    />
  );
}