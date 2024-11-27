import React, { useEffect, useContext, useCallback, useState } from "react";
import { View, ActivityIndicator, RefreshControl, FlatList, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useStocks } from "../hooks/useStocks";
import { useBalance } from "../hooks/useBalance";
import { FavoritesContext } from "../context/FavoritesContext";
import { SearchBar } from "../components/SearchBar";
import { StockItem } from "../components/StockItem";
import { BuyModal } from "../components/BuyModal";

export default function MercadoScreen() {
  const { favorites, addFavorite, removeFavorite, fetchFavorites } = useContext(FavoritesContext);
  const { fetchBalance, balance, setBalance } = useBalance();
  const { stocks, filteredStocks, loading, refreshing, searchQuery, setSearchQuery, fetchStocks, searchStocks } = useStocks();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    fetchBalance();
    fetchFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
      fetchStocks();
      fetchFavorites();
    }, [])
  );

  const toggleFavorite = (symbol) => {
    if (favorites.includes(symbol)) {
      removeFavorite(symbol);
    } else {
      addFavorite(symbol);
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar
        balance={balance}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchStocks={searchStocks}
        styles={styles}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <StockItem
              item={item}
              isFavorite={favorites.includes(item.symbol)}
              toggleFavorite={toggleFavorite}
              onBuyPress={() => {
                setSelectedStock(item);
                setModalVisible(true);
              }}
              styles={styles}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchStocks} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma ação encontrada.</Text>
            </View>
          }
        />
      )}

      <BuyModal
        visible={modalVisible}
        stock={selectedStock}
        onClose={() => setModalVisible(false)}
        styles={styles}
        fetchStocks={fetchStocks}
        setBalance={setBalance}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20, 
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
  },
  balanceContainer: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10, 
  },
  balanceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  stockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 60, 
    left: 15,
  },
  symbol: {
    fontSize: 16,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 14,
    color: "#666",
    flexShrink: 1, 
  },
  priceContainer: {
    alignItems: "flex-end",
    marginBottom: 50,
    marginRight:20 
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  changeContainer: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-start", 
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSymbol: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});