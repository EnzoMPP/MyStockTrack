import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

//usado para exibir as ações na tela de mercado e de favoritos
export const StockItem = ({ item, isFavorite, toggleFavorite, onBuyPress, styles }) => (
  <View style={styles.stockItem}>
    <View style={styles.stockInfo}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.logo || "https://via.placeholder.com/50"}}
          style={styles.logo}
        /> 
        <TouchableOpacity
          onPress={() => toggleFavorite(item.symbol)}
          style={styles.favoriteIcon}
        >
          <Icon
          // Define o ícone de estrela preenchida quando favoritado e ícone de estrela vazia quando não favoritado
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
            color: item.changePercent >= 0 ? "#34A853" : "#EA4335",//define a cor do texto de acordo com a variação percentual
          }}
        >
          {item.changePercent >= 0 ? "+" : ""/*se a variação for positiva, coloca o sinal de + se não mantém negativo como ja vem do finnhub*/}
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