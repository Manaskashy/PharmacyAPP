import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useNotifications } from '../Context/NotificationContext';

const FloatingNotifications = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { unreadCount } = useNotifications();

  // Exclusion list similar to FloatingCart
  const excludedScreens = [
    'Login',
    'LoaderScreen'
  ];

  if (excludedScreens.includes(route.name)) {
    return null;
  }

  return (
    <Pressable 
      style={styles.container}
      onPress={() => navigation.navigate('Notifications')}
    >
      <View style={styles.fab}>
        <Icon name="bell" size={32} color="#000000" />
        {unreadCount > 0 && <View style={styles.badge} />}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110, // Positioned above FloatingCart (30 + 64 + 16)
    right: 20,
    zIndex: 9999,
  },
  fab: {
    backgroundColor: 'transparent',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4ECDC4', // Bright teal for the badge
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default FloatingNotifications;
