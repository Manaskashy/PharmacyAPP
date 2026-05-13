import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import notificationService, { NotificationResponse } from '../Services/notificationService';

const NOTIFICATIONS_STORAGE_KEY = '@pharmacy_notifications';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'promo' | 'health' | 'reminder' | 'appointment' | 'system';
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isFirstLoad = useRef(true);

  // Initialize Notifee Channel for Android
  useEffect(() => {
    const initNotifee = async () => {
      // Request permissions (required for iOS)
      await notifee.requestPermission();

      // Create a channel (required for Android)
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    };
    initNotifee();
  }, []);

  const mapBackendToFrontend = (n: NotificationResponse): Notification => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: n.type as any,
    read: n.isRead
  });

  const displayLocalNotification = async (title: string, body: string) => {
    await notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      const mapped = data.map(mapBackendToFrontend);
      
      // Check for new notifications to trigger sound
      if (!isFirstLoad.current && mapped.length > notifications.length) {
        // If we have more notifications than before, trigger a sound/alert for the newest one
        const latest = mapped[0];
        if (latest) {
          displayLocalNotification(latest.title, latest.message);
        }
      }

      setNotifications(mapped);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mapped));
      isFirstLoad.current = false;
    } catch (e) {
      console.error('Failed to fetch notifications from API', e);
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Optional: Set up an interval to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: 'Just now',
      type,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    displayLocalNotification(title, message); // Play sound for manually added local notifs too
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      await notificationService.markAsRead(id);
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await notificationService.markAllAsRead();
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await notificationService.deleteNotification(id);
    } catch (e) {
      console.error('Failed to delete notification', e);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading,
      addNotification, 
      markAsRead, 
      markAllAsRead, 
      deleteNotification,
      refreshNotifications: fetchNotifications,
      clearAll 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
