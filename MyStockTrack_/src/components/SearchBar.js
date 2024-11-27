import React from "react";
import { View, TextInput, Text } from "react-native";

export const SearchBar = ({ balance, searchQuery, setSearchQuery, searchStocks, styles }) => (
  <View>
    <View style={styles.balanceContainer}>
      <Text style={styles.balanceText}>Saldo: $ {balance.toFixed(2)}</Text>
    </View>
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar ações..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        onSubmitEditing={searchStocks}
        keyboardType="default"
      />
    </View>
  </View>
);