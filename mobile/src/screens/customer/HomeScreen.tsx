import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Welcome to Zotpot</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Find and order your favorite food
        </Text>
      </View>

      <View style={styles.categoriesSection}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Categories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Placeholder for categories */}
          <Card style={styles.categoryCard}>
            <Card.Cover source={{ uri: 'https://picsum.photos/200' }} />
            <Card.Title title="Fast Food" />
          </Card>
          <Card style={styles.categoryCard}>
            <Card.Cover source={{ uri: 'https://picsum.photos/201' }} />
            <Card.Title title="Healthy" />
          </Card>
          <Card style={styles.categoryCard}>
            <Card.Cover source={{ uri: 'https://picsum.photos/202' }} />
            <Card.Title title="Desserts" />
          </Card>
        </ScrollView>
      </View>

      <View style={styles.popularSection}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Popular Now
        </Text>
        {/* Placeholder for popular items */}
        <Card style={styles.foodCard}>
          <Card.Cover source={{ uri: 'https://picsum.photos/300' }} />
          <Card.Title title="Delicious Burger" subtitle="$9.99" />
        </Card>
        <Card style={styles.foodCard}>
          <Card.Cover source={{ uri: 'https://picsum.photos/301' }} />
          <Card.Title title="Fresh Salad" subtitle="$7.99" />
        </Card>
      </View>
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
  subtitle: {
    opacity: 0.7,
    marginTop: 5,
  },
  categoriesSection: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  categoryCard: {
    width: 150,
    marginRight: 10,
  },
  popularSection: {
    padding: 20,
  },
  foodCard: {
    marginBottom: 15,
  },
});

export default HomeScreen; 