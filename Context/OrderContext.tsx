import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ORDERS_STORAGE_KEY = '@pharmacy_orders';

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Delivered' | 'Pending' | 'Shipped';
  total: string;
  items: string;
  icon: string;
  color: string;
}

interface OrderContextType {
  orders: OrderItem[];
  addOrder: (order: Omit<OrderItem, 'id' | 'orderNumber' | 'date' | 'status'>) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load orders from AsyncStorage on first mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const stored = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
        if (stored) {
          setOrders(JSON.parse(stored));
        } else {
          // Seed with one example order the very first time
          setOrders([
            {
              id: '1',
              orderNumber: 'ORD-2026-9812',
              date: 'Mar 26, 2026',
              status: 'Delivered',
              total: '₹1,450',
              items: 'Multivitamin Men, Omega-3 + 1 more',
              icon: 'package-variant-closed',
              color: '#4ECDC4',
            },
          ]);
        }
      } catch (e) {
        console.error('Failed to load orders from storage', e);
      } finally {
        setLoaded(true);
      }
    };
    loadOrders();
  }, []);

  // Save orders to AsyncStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (!loaded) return;
    const saveOrders = async () => {
      try {
        await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      } catch (e) {
        console.error('Failed to save orders to storage', e);
      }
    };
    saveOrders();
  }, [orders, loaded]);

  const addOrder = (newOrderData: Omit<OrderItem, 'id' | 'orderNumber' | 'date' | 'status'>) => {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const orderId = Math.random().toString(36).substr(2, 9);
    const orderNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const fullOrder: OrderItem = {
      ...newOrderData,
      id: orderId,
      orderNumber: orderNum,
      date: dateString,
      status: 'Pending',
    };

    setOrders(prevOrders => [fullOrder, ...prevOrders]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
