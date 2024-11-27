import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function FavoriteStockItem({ item, onRemove }) {
  return (
    <TouchableOpacity style={styles.stockCard}>
      <View style={styles.stockHeader}>
        <View style={styles.stockInfo}>
          {item.logo ? (
            <Image source={{ uri: item.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{item.symbol[0]}</Text>
            </View>
          )}
          <View>
            <Text style={styles.symbolText}>{item.symbol}</Text>
            <Text style={styles.companyName}>{item.companyName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onRemove(item.symbol)}>
          <Icon name="star" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.currentPrice}>
          ${item.currentPrice?.toFixed(2) || 'N/A'}
        </Text>
        <View
          style={[
            styles.changeContainer,
            {
              backgroundColor: item.changePercent >= 0 ? "#e6f4ea" : "#fce8e6",
            },
          ]}
        >
          <Text
            style={[
              styles.changeText,
              {
                color: item.changePercent >= 0 ? "#137333" : "#c5221f",
              },
            ]}
          >
            {item.changePercent >= 0 ? "+" : ""}
            {item.changePercent?.toFixed(2) || '0.00'}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  stockCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  symbolText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  companyName: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  changeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});