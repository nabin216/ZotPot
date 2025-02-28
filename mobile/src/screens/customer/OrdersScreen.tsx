import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';

const OrdersScreen = () => {
  // Placeholder orders data
  const orders = [
    {
      id: '1',
      date: '2024-02-28',
      status: 'Delivered',
      items: ['Burger', 'Fries', 'Coke'],
      total: 24.99,
    },
    {
      id: '2',
      date: '2024-02-27',
      status: 'In Progress',
      items: ['Pizza', 'Garlic Bread'],
      total: 29.99,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'green';
      case 'In Progress':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Your Orders</Text>
      </View>

      {orders.map((order) => (
        <Card key={order.id} style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <Text variant="titleMedium">Order #{order.id}</Text>
              <Chip
                textStyle={{ color: 'white' }}
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status}
              </Chip>
            </View>
            
            <Text variant="bodyMedium" style={styles.date}>
              {new Date(order.date).toLocaleDateString()}
            </Text>
            
            <Text variant="bodyMedium" style={styles.items}>
              {order.items.join(', ')}
            </Text>
            
            <Text variant="titleMedium" style={styles.total}>
              Total: ${order.total}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  orderCard: {
    margin: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    opacity: 0.7,
    marginBottom: 5,
  },
  items: {
    marginBottom: 10,
  },
  total: {
    fontWeight: 'bold',
  },
});

export default OrdersScreen; 