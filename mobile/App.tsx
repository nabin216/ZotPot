import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './src/theme';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrPt2dk9H4vhC9ko7iEIwn5Mg6vtRsHN8",
  projectId: "zotpot-ffa75",
  storageBucket: "zotpot-ffa75.firebasestorage.app",
  appId: "1:971528609362:android:eb3f3b0dc068b7db10098b",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Enable local persistence
auth.setPersistence(browserLocalPersistence);

// Initialize QueryClient
const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  async function registerForPushNotifications() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for notifications');
        return;
      }

      // Get the Expo push token
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Expo Push Token:', token.data);

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

    } catch (error) {
      console.log('Error getting push token:', error);
    }
  }

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <PaperProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
                <RootNavigator />
                <StatusBar style="auto" />
              </StripeProvider>
            </NavigationContainer>
          </QueryClientProvider>
        </PaperProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
} 