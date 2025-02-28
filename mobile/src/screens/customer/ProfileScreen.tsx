import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, List, Button, Divider } from 'react-native-paper';

const ProfileScreen = () => {
  // Placeholder user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, City, Country',
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout pressed');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user.name.split(' ').map(n => n[0]).join('')}
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.name}>{user.name}</Text>
        <Text variant="bodyLarge" style={styles.email}>{user.email}</Text>
      </View>

      <List.Section>
        <List.Subheader>Personal Information</List.Subheader>
        <List.Item
          title="Phone Number"
          description={user.phone}
          left={props => <List.Icon {...props} icon="phone" />}
        />
        <Divider />
        <List.Item
          title="Address"
          description={user.address}
          left={props => <List.Icon {...props} icon="map-marker" />}
        />
        <Divider />
        <List.Item
          title="Payment Methods"
          left={props => <List.Icon {...props} icon="credit-card" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Language"
          description="English"
          left={props => <List.Icon {...props} icon="translate" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Support</List.Subheader>
        <List.Item
          title="Help Center"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="About Us"
          left={props => <List.Icon {...props} icon="information" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      <Button 
        mode="contained" 
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  avatar: {
    marginBottom: 10,
  },
  name: {
    marginBottom: 5,
  },
  email: {
    opacity: 0.7,
  },
  logoutButton: {
    margin: 20,
  },
});

export default ProfileScreen; 