import React from "react";
import { View, Text, FlatList, StyleSheet, Button, Modal } from "react-native";
import AssetItem from "./AssetItem";

const SellModal = ({
  // parâmetros do modal de venda de ações
  visible,
  onClose,
  assets,
  quantities,
  setQuantities,
  handleSell,
}) => {
  const renderItem = ({ item }) => (
    <AssetItem
      // Renderiza o componente AssetItem para cada ação comprada
      asset={item}
      sellQuantity={quantities[item.symbol] || ""}
      onQuantityChange={(quantity) => {
        setQuantities((prev) => ({ ...prev, [item.symbol]: quantity }));
      }}
      onSell={() => handleSell(item)}
    />
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ações Compradas</Text>
          {assets?.length > 0 ? (
            <FlatList
              data={assets} // data recebe a lista de ações compradas
              keyExtractor={(item) => item.symbol} // Define a chave de cada item que é o símbolo da ação (symbol)
              renderItem={renderItem}
              style={styles.assetsList}
              keyboardShouldPersistTaps="always" // Mantém o teclado aberto ao clicar em um item
              keyboardDismissMode="none" // Não fecha o teclado ao arrastar a lista PARA CIMA
              removeClippedSubviews={false} // Evita que a lista some ao abrir o teclado
            />
          ) : (
            <Text style={styles.emptyText}>Nenhuma ação comprada.</Text> // Mensagem exibida quando não há ações compradas ainda
          )}
          <View style={styles.modalButtonContainer}>
            <Button title="Fechar" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%", // Limita a altura máxima do conteúdo do modal
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  assetsList: {
    maxHeight: 300, 
  },
  modalButtonContainer: {
    marginTop: 20,
    width: "100%",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 16,
  },
});

export default SellModal;