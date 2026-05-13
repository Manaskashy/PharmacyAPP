import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../Context/CartContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const FloatingCart = () => {
  const { totalItems } = useCart();
  const navigation = useNavigation<any>();
  const route = useRoute();

  // Exclusion list based on user request
  const excludedScreens = [
    'DoctorConsultant',
    'HomeCare',
    'Ambulance',
    'HealthVault',
    'Cart',
    'PaymentScreen',
    'Login',
    'LoaderScreen'
  ];

  if (excludedScreens.includes(route.name)) {
    return null;
  }

  return (
    <Pressable 
      style={styles.container}
      onPress={() => navigation.navigate('Cart')}
    >
      <View style={styles.fab}>
        <Icon name="cart" size={32} color="#FF6B6B" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
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
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A535C',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
});

export default FloatingCart;
