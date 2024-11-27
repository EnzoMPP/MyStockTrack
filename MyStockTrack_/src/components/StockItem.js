import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";


export const StockItem = ({ item, isFavorite, toggleFavorite, onBuyPress, styles }) => (
  <View style={styles.stockItem}>
    <View style={styles.stockInfo}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.logo || "https://via.placeholder.com/50" }}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() => toggleFavorite(item.symbol)}
          style={styles.favoriteIcon}
        >
          <Icon
            name={isFavorite ? "star" : "star-o"}
            size={24}
            color={isFavorite ? "#FFD700" : "#ccc"}
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

    <TouchableOpacity
      style={styles.buyButton}
      onPress={onBuyPress}
    >
      <Text style={styles.buyButtonText}>Comprar</Text>
    </TouchableOpacity>
  </View>
);