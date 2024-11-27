import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PortfolioSummary({ summary }) {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Total Investido:</Text>
        <Text style={styles.summaryValue}>
          ${" "}
          {summary.totalInvested.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </View>

      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Valor Atual:</Text>
        <Text
          style={[
            styles.summaryValue,
            {
              color:
                summary.currentValue > summary.totalInvested
                  ? "#1e8e3e"
                  : "#d93025",
            },
          ]}
        >
          ${" "}
          {summary.currentValue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </View>

      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Rentabilidade:</Text>
        <Text
          style={[
            styles.summaryValue,
            {
              color:
                summary.monthlyProfitability >= 0
                  ? "#1e8e3e"
                  : "#d93025",
            },
          ]}
        >
          {summary.monthlyProfitability.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 20,
    width: "100%",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#555",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});