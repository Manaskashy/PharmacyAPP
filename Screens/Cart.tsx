import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  StatusBar,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart, CartItem } from '../Context/CartContext';

const Cart = ({ navigation }: { navigation: any }) => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItems } = useCart();

  const parsePrice = (p: string): number => {
    const cleaned = p.replace(/[₹$,\s]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;

  const formatINR = (val: number) => `₹${val.toFixed(2)}`;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    navigation.navigate('PaymentScreen', {
      title: `${cartItems.length} Cart Item${cartItems.length > 1 ? 's' : ''}`,
      subtitle: cartItems.map(i => i.name).join(', '),
      price: formatINR(subtotal),
      quantity: 1, 
      icon: 'cart',
      iconColor: '#3182CE'
    });
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={[styles.itemIcon, { backgroundColor: `${item.color}15` }]}>
        <Icon name={item.icon} size={32} color={item.color} />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
      </View>
      
      <View style={styles.quantityControl}>
        <Pressable 
          style={styles.quantityBtn}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Icon name={item.quantity <= 1 ? "delete-outline" : "minus"} size={16} color={item.quantity <= 1 ? "#E53E3E" : "#1A535C"} />
        </Pressable>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <Pressable 
          style={styles.quantityBtn}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Icon name="plus" size={16} color="#1A535C" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#1A535C" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>{totalItems} Items</Text>
        </View>
        {cartItems.length > 0 && (
          <Pressable onPress={clearCart} style={styles.clearButton}>
             <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="cart-outline" size={80} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>Your Cart is Empty!</Text>
          <Text style={styles.emptySubtitle}>Looks like you haven't added anything yet.</Text>
          <Pressable 
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Browse Services</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatINR(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (GST 18%)</Text>
              <Text style={styles.summaryValue}>{formatINR(gstAmount)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total Amount</Text>
              <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
            </View>
            
            <Pressable 
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Icon name="arrow-right" size={20} color="white" />
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FFF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#F7FFF7',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A535C',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: '#E53E3E',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  itemIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A535C',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FA',
    borderRadius: 12,
    padding: 4,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    marginHorizontal: 12,
  },
  footer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '700',
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    marginBottom: 24,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A535C',
  },
  checkoutButton: {
    backgroundColor: '#1A535C',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3748',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  browseButton: {
    backgroundColor: '#1A535C',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Cart;
