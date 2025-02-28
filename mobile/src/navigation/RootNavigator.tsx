import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import DeliveryAgentNavigator from './DeliveryAgentNavigator';
import AdminNavigator from './AdminNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Customer: undefined;
  DeliveryAgent: undefined;
  Admin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'customer' ? (
        <Stack.Screen name="Customer" component={CustomerNavigator} />
      ) : user.role === 'delivery_agent' ? (
        <Stack.Screen name="DeliveryAgent" component={DeliveryAgentNavigator} />
      ) : (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator; 