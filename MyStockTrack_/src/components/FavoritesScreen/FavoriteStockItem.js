import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export const FavoriteStockItem = ({ item, onRemove }) => (
  <View style={styles.stockItem}>
    <View style={styles.stockInfo}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.logo || "https://via.placeholder.com/50" }}//se não tiver logo, coloca uma imagem padrão
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => onRemove(item.symbol)} 
          style={styles.favoriteIcon}
        >
          <Icon
          // Define o ícone de estrela preenchida quando favoritado e ícone de estrela vazia quando não favoritado
            name="star"
            size={24}
            color="#FFD700"
          />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <Text style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">
          {item.companyName}
        </Text>
      </View>
    </View>

    <View style={styles.priceContainer}>
      <Text style={styles.currentPrice}> 
        {item.currentPrice !== undefined && item.currentPrice !== null
          ? `$${item.currentPrice.toFixed(2)}`
          : "N/A"}
      </Text>
      <View
        style={[
          styles.changeContainer,
          {
            backgroundColor:
              item.changePercent >= 0 ? "#e6f4ea" : "#fce8e6",
          },
        ]}
      >
        <Text
          style={{
            color: item.changePercent >= 0 ? "#34A853" : "#EA4335",
          }}
        >
          {item.changePercent >= 0 ? "+" : ""}
          {item.changePercent !== undefined && item.changePercent !== null
            ? `${item.changePercent.toFixed(2)}%`
            : "N/A"} 
        </Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
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
    top: 25, 
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
    marginBottom: 10, 
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
});

export default FavoriteStockItem;