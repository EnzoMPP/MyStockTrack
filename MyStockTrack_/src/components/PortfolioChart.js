import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Plotly from "react-native-plotly";

const screenWidth = Dimensions.get("window").width;

export default function PortfolioChart({ data }) {
  const chartData = [
    {
      // Define os valores do eixo x e y do gráfico
      x: data.map((stock) => stock.symbol),
      y: data.map((stock) => stock.currentValue),
      type: "bar",
      marker: { color: "#4285F4" },
    },
  ];

  const chartLayout = {
    // Define o layout do gráfico
    title: "Valor Investido por Ação",
    xaxis: {
      title: "Ações",
      tickangle: -90,
      automargin: true,
    },
    yaxis: {
      title: "Valor Investido ($)",
      automargin: true,
      rangemode: "tozero",
      type: "linear",
    },
    margin: { l: 50, r: 40, t: 60, b: 80 },
    bargap: 0.2, //bargap define o espaço entre as barras do gráfico
    height: 400,
    width: screenWidth - 52,
  };

  return (
    <View style={styles.chartContainer}>
      <Plotly
      // Renderiza o gráfico Plotly com os dados
        data={chartData}
        layout={chartLayout} 
        style={styles.plotlyStyle}
        config={{
          displayModeBar: false, //tira as ações do gráfico deixando ele apenas visível
          responsive: true,
        }}
        useResizeHandler={false} //desaabilita o redimensionamento do gráfico
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