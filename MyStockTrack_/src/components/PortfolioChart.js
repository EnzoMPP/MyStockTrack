import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Plotly from "react-native-plotly";

const screenWidth = Dimensions.get("window").width;

export default function PortfolioChart({ data }) {
  const chartData = [
    {
      x: data.map((stock) => stock.symbol),
      y: data.map((stock) => stock.currentValue),
      type: "bar",
      marker: { color: "#4285F4" },
    },
  ];

  const chartLayout = {
    title: "Valor Investido por Ação",
    xaxis: {
      title: "Ações",
      tickangle: -45,
      automargin: true,
    },
    yaxis: {
      title: "Valor Investido ($)",
      automargin: true,
      rangemode: "tozero",
      type: "linear",
    },
    margin: { l: 50, r: 40, t: 60, b: 80 },
    bargap: 0.2,
    height: 400,
    width: screenWidth - 52,
  };

  return (
    <View style={styles.chartContainer}>
      <Plotly
        data={chartData}
        layout={chartLayout}
        style={styles.plotlyStyle}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        useResizeHandler={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    width: screenWidth - 32,
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    padding: 10,
    marginBottom: 20,
  },
  plotlyStyle: {
    flex: 1,
    borderRadius: 8,
  },
});