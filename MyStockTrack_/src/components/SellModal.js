import React from "react";
import { View, Text, FlatList, StyleSheet, Button, Modal } from "react-native";
import AssetItem from "./AssetItem";

const SellModal = ({
  visible,
  onClose,
  assets,
  quantities,
  setQuantities,
  handleSell,
}) => {
  const renderItem = ({ item }) => (
    <AssetItem
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
              data={assets}
              keyExtractor={(item) => item.symbol}
              renderItem={renderItem}
              style={styles.assetsList}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              removeClippedSubviews={false}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhuma ação comprada.</Text>
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
    maxHeight: "80%",
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
    width: "100%",
    marginVertical: 10,
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