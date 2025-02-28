import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Image, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Card,
  IconButton,
  Divider,
  useTheme,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '../../store';
import {
  updateQuantity,
  removeItem,
  clearCart,
} from '../../store/slices/cartSlice';
import { addOrder } from '../../store/slices/orderSlice';

const CartScreen = () => {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const { items, total } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity === 0) {
      dispatch(removeItem(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleCheckout = async () => {
    try {
      // TODO: Implement actual checkout API call
      const response = await fetch('YOUR_API_ENDPOINT/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          total,
        }),
      });

      const data = await response.json();
      dispatch(addOrder(data));
      dispatch(clearCart());
      setIsConfirmModalVisible(false);
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.itemCard}>
      <Card.Content style={styles.cardContent}>
        <Card.Cover 
          source={{ uri: item.image }} 
          style={styles.itemImage}
        />
        <View style={styles.itemDetails}>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodyMedium">${item.price}</Text>
          <View style={styles.quantityContainer}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
            />
            <Text variant="bodyLarge">{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.itemsContainer}>
        {items.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <Card.Content style={styles.cardContent}>
              <Card.Cover 
                source={{ uri: item.image }} 
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodyMedium">${item.price}</Text>
                <View style={styles.quantityContainer}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                  />
                  <Text variant="bodyLarge">{item.quantity}</Text>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Card style={styles.totalCard}>
        <Card.Content>
          <View style={styles.totalRow}>
            <Text variant="titleMedium">Subtotal</Text>
            <Text variant="titleMedium">${calculateTotal().toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text variant="bodyMedium">Delivery Fee</Text>
            <Text variant="bodyMedium">$2.99</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text variant="titleLarge">Total</Text>
            <Text variant="titleLarge">${(calculateTotal() + 2.99).toFixed(2)}</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => setIsConfirmModalVisible(true)}
            style={styles.checkoutButton}
          >
            Proceed to Checkout
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={isConfirmModalVisible}
          onDismiss={() => setIsConfirmModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Confirm Order
          </Text>
          <Text variant="bodyLarge" style={styles.modalText}>
            Are you sure you want to place this order?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setIsConfirmModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={styles.modalButton}
            >
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemsContainer: {
    flex: 1,
    padding: 10,
  },
  itemCard: {
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  totalCard: {
    margin: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    marginTop: 10,
  },
  checkoutButton: {
    marginTop: 10,
  },
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    minWidth: 120,
  },
});

export default CartScreen; 