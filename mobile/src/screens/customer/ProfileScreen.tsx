import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Text, Avatar, List, Button, Divider, ActivityIndicator, Portal, Dialog, TextInput, Snackbar } from 'react-native-paper';
import { getAuth, signOut, updateEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout, updateUser } from '../../store/slices/authSlice';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  avatar?: string | null;
}

interface EditDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (value: string) => Promise<void>;
  value: string;
  label: string;
  loading: boolean;
  fieldType: keyof UserData;
}

interface DialogAction {
  text: string;
  onPress: () => void;
  style?: 'cancel' | 'default';
}

interface DialogProps {
  title: string;
  content: string;
  actions: DialogAction[];
}

const EditDialog: React.FC<EditDialogProps> = ({
  visible,
  onDismiss,
  onSave,
  value,
  label,
  loading,
  fieldType
}) => {
  const [editedValue, setEditedValue] = useState(value);
  const [error, setError] = useState('');

  const validateField = (value: string): boolean => {
    setError('');
    
    if (!value.trim()) {
      setError(`${label} cannot be empty`);
      return false;
    }

    switch (fieldType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      
      case 'phone':
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (value && !phoneRegex.test(value)) {
          setError('Please enter a valid phone number');
          return false;
        }
        break;

      case 'name':
        if (value.length < 2) {
          setError('Name must be at least 2 characters long');
          return false;
        }
        break;
    }

    return true;
  };

  const handleSave = async () => {
    if (validateField(editedValue)) {
      await onSave(editedValue);
    }
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>Edit {label}</Dialog.Title>
      <Dialog.Content>
        <TextInput
          label={label}
          value={editedValue}
          onChangeText={(text) => {
            setEditedValue(text);
            setError('');
          }}
          mode="outlined"
          error={!!error}
          keyboardType={fieldType === 'phone' ? 'phone-pad' : 
                       fieldType === 'email' ? 'email-address' : 'default'}
          autoCapitalize={fieldType === 'email' ? 'none' : 'words'}
        />
        {error && (
          <Text style={{ color: 'red', marginTop: 5, fontSize: 12 }}>
            {error}
          </Text>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button 
          onPress={handleSave}
          loading={loading}
          disabled={loading || editedValue === value || !!error}
        >
          Save
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const createTestUser = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('No authenticated user found');
      return;
    }

    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);

    const userData: UserData = {
      name: 'John Doe',
      email: user.email || '',
      role: 'customer',
      phone: '+1234567890',
      address: '123 Main St, City, Country'
    };

    await setDoc(userRef, userData);
    console.log('Test user document created successfully');
    return userData;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState<keyof UserData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          navigation.navigate('Auth');
          return;
        }

        const db = getFirestore();
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.log('Creating test user document...');
          const newUserData = await createTestUser();
          setUserData(newUserData || null);
        } else {
          const data = userDoc.data() as UserData;
          setUserData(data);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        showMessage('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      await signOut(auth);
      dispatch(logout());
    } catch (error) {
      console.error('Error logging out:', error);
      showMessage('Error logging out');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  const handleUpdateField = async (value: string) => {
    if (!editField || !userData) return;

    try {
      setEditLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        showMessage('User not authenticated');
        return;
      }

      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);

      // Special handling for email updates
      if (editField === 'email') {
        await updateEmail(user, value);
      }

      // Update Firestore
      await updateDoc(userRef, { [editField]: value });

      // Update local state
      setUserData({ ...userData, [editField]: value });
      
      // Update Redux state
      dispatch(updateUser({ [editField]: value }));

      showMessage(`${editField} updated successfully`);
      setEditField(null);
    } catch (error) {
      console.error(`Error updating ${editField}:`, error);
      showMessage(`Error updating ${editField}`);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.name}>{userData?.name}</Text>
        <Button 
          mode="contained"
          onPress={async () => {
            try {
              setLoading(true);
              const newUserData = await createTestUser();
              if (newUserData) {
                setUserData(newUserData);
                showMessage('Test user created successfully');
              }
            } catch (error) {
              showMessage('Error creating test user');
            } finally {
              setLoading(false);
            }
          }}
          style={styles.createTestButton}
        >
          Create Test User
        </Button>
      </View>

      <List.Section>
        <List.Subheader>Personal Information</List.Subheader>
        <List.Item
          title="Name"
          description={userData.name}
          left={props => <List.Icon {...props} icon="account" />}
          right={props => <List.Icon {...props} icon="pencil" />}
          onPress={() => setEditField('name')}
        />
        <Divider />
        <List.Item
          title="Email"
          description={userData.email}
          left={props => <List.Icon {...props} icon="email" />}
          right={props => <List.Icon {...props} icon="pencil" />}
          onPress={() => setEditField('email')}
        />
        <Divider />
        <List.Item
          title="Phone Number"
          description={userData.phone || 'Not set'}
          left={props => <List.Icon {...props} icon="phone" />}
          right={props => <List.Icon {...props} icon="pencil" />}
          onPress={() => setEditField('phone')}
        />
        <Divider />
        <List.Item
          title="Address"
          description={userData.address || 'Not set'}
          left={props => <List.Icon {...props} icon="map-marker" />}
          right={props => <List.Icon {...props} icon="pencil" />}
          onPress={() => setEditField('address')}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* TODO: Implement notifications settings */}}
        />
        <Divider />
        <List.Item
          title="Language"
          description="English"
          left={props => <List.Icon {...props} icon="translate" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* TODO: Implement language settings */}}
        />
      </List.Section>

      <Button 
        mode="contained" 
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
        disabled={loading}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </Button>

      <Portal>
        <EditDialog
          visible={!!editField}
          onDismiss={() => setEditField(null)}
          onSave={handleUpdateField}
          value={editField ? userData[editField]?.toString() || '' : ''}
          label={editField ? editField.charAt(0).toUpperCase() + editField.slice(1) : ''}
          loading={editLoading}
          fieldType={editField || 'name'}
        />
      </Portal>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 20,
  },
  createTestButton: {
    marginTop: 10,
  },
});

export default ProfileScreen; 