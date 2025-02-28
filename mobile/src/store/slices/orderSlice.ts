import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryLocation: Location;
  deliveryAgent?: {
    id: string;
    name: string;
    phone: string;
    currentLocation?: Location;
  };
  createdAt: string;
  estimatedDeliveryTime?: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: Order['status'] }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
      if (state.currentOrder?.id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status;
      }
    },
    updateDeliveryAgentLocation: (
      state,
      action: PayloadAction<{ orderId: string; location: Location }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order?.deliveryAgent) {
        order.deliveryAgent.currentLocation = action.payload.location;
      }
      if (state.currentOrder?.id === action.payload.orderId && state.currentOrder.deliveryAgent) {
        state.currentOrder.deliveryAgent.currentLocation = action.payload.location;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOrders,
  addOrder,
  setCurrentOrder,
  updateOrderStatus,
  updateDeliveryAgentLocation,
  setLoading,
  setError,
} = orderSlice.actions;
export default orderSlice.reducer; 