import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrders } from '../Context/OrderContext';
import { useNotifications } from '../Context/NotificationContext';
import { useCart } from '../Context/CartContext';
import orderService from '../Services/orderservice';
import addressService, { Address as SavedAddress } from '../Services/addressService';

const PaymentScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { title, subtitle, price, quantity, icon, iconColor = '#1A535C', productId } = route.params;
  const { addOrder } = useOrders();
  const { addNotification } = useNotifications();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  React.useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      if (data && data.length > 0) {
        setSavedAddresses(data);
        // Find default or first address
        const def = data.find((a: SavedAddress) => a.isDefault) || data[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch (e) {
      console.error('Error loading addresses:', e);
    }
  };

  const parsePrice = (p: string): number => {
    const cleaned = p.replace(/[₹$,\s]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const unitPrice = parsePrice(price);
  const subtotal = unitPrice * quantity;
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;
  const formatINR = (val: number) => `₹${val.toFixed(2)}`;

  const handleConfirmPayment = async () => {
    if (!selectedMethod) return;
    if (!selectedAddressId) {
      Alert.alert('Please select a shipping address');
      return;
    }
    setLoading(true);

    try {
      const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
      if (!selectedAddr) throw new Error('Selected address not found');

      // Build order items for backend
      let items: { productId: string; quantity: number }[] = [];
      const isCartMode = title.toLowerCase().includes('cart item');

      if (isCartMode) {
        items = cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }));
      } else {
        if (!productId) throw new Error('Product ID missing for direct buy');
        items = [{ productId, quantity }];
      }

      // 1. Call real backend API
      const response = await orderService.placeOrder({
        items,
        addressId: selectedAddressId
      });

      // 2. Fallback update for local context (legacy synchronization)
      const displayName = title.toLowerCase().includes('cart item') && subtitle ? subtitle : title;
      const orderItemsSummary = title.toLowerCase().includes('cart item') ? displayName : `${quantity}x ${displayName}`;

      addOrder({
        total: formatINR(grandTotal),
        items: orderItemsSummary,
        icon: icon || 'package-variant-closed',
        color: iconColor || '#1A535C',
      });

      // 3. Trigger Notifications
      addNotification('Payment Successful', `Your payment of ${formatINR(grandTotal)} was processed successfully via ${selectedMethod === 'upi' ? 'UPI' : 'COD'}.`, 'promo');
      addNotification('Order Placed', `Order #${response.orderId} has been placed successfully.`, 'order');

      // 4. Cart Synchronization
      if (isCartMode) {
        clearCart();
      } else {
        const cartItem = cartItems.find(item => item.productId === productId);
        if (cartItem) {
          removeFromCart(cartItem.id);
        }
      }

      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigation.navigate('Home'), 2000);
    } catch (error: any) {
      console.error('Order Error:', error);
      setLoading(false);
      // In a real app, we would show a snackbar/toast error here
      Alert.alert(error.response?.data?.message || error.message || 'Failed to place order');
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.successScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.successContent}>
          <View style={styles.successCircle}>
            <View style={styles.successCircleInner}>
              <Icon name="check" size={64} color="white" />
            </View>
          </View>
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your {selectedMethod === 'cod' ? 'Cash on Delivery' : 'UPI'} payment for
          </Text>
          <Text style={styles.successItemName}>
            {title.toLowerCase().includes('cart item') && subtitle ? subtitle : title}
          </Text>
          {quantity > 1 && <Text style={styles.successQuantity}>Quantity: {quantity}</Text>}
          <View style={styles.successAmountBadge}>
            <Text style={styles.successAmountLabel}>Total Paid (incl. GST)</Text>
            <Text style={styles.successAmount}>{formatINR(grandTotal)}</Text>
          </View>
          <Text style={styles.successNote}>
            {selectedMethod === 'cod'
              ? 'You will pay at the time of delivery.'
              : 'Payment was processed via UPI.'}
          </Text>
          <View style={styles.redirectNote}>
            <Icon name="loading" size={16} color="#CBD5E0" />
            <Text style={styles.redirectText}>Redirecting to Home...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={22} color="#2D3748" />
        </Pressable>
        <View>
          <Text style={styles.stepLabel}>Order Summary</Text>
          <Text style={styles.headerTitle}>Payments</Text>
        </View>
        <View style={styles.secureTag}>
          <Icon name="lock" size={12} color="#38A169" />
          <Text style={styles.secureText}>100% Secure</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Total Amount Banner */}
        <TouchableOpacity
          style={styles.totalBanner}
          onPress={() => setShowBreakdown(!showBreakdown)}
          activeOpacity={0.85}
        >
          <View style={styles.totalBannerLeft}>
            <Icon name="format-list-bulleted" size={16} color="#3182CE" style={{ marginRight: 6 }} />
            <Text style={styles.totalBannerLabel}>Total Amount</Text>
            <Icon
              name={showBreakdown ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#3182CE"
              style={{ marginLeft: 4 }}
            />
          </View>
          <Text style={styles.totalBannerAmount}>{formatINR(grandTotal)}</Text>
        </TouchableOpacity>

        {/* Price Breakdown (expandable) */}
        {showBreakdown && (
          <View style={styles.breakdownBox}>
            <View style={styles.breakdownItem}>
              <View style={[styles.itemIconSm, { backgroundColor: `${iconColor}15` }]}>
                <Icon name={icon} size={20} color={iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.breakdownItemTitle}>{title}</Text>
                {subtitle && <Text style={styles.breakdownItemSub}>{subtitle}</Text>}
              </View>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Unit Price</Text>
              <Text style={styles.breakdownValue}>{formatINR(unitPrice)}</Text>
            </View>
            {quantity > 1 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Qty ({quantity} × {formatINR(unitPrice)})</Text>
                <Text style={styles.breakdownValue}>{formatINR(subtotal)}</Text>
              </View>
            )}
            <View style={styles.breakdownRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.breakdownLabel}>GST</Text>
                <View style={styles.gstBadge}>
                  <Text style={styles.gstBadgeText}>18%</Text>
                </View>
              </View>
              <Text style={styles.breakdownValue}>+{formatINR(gstAmount)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
            </View>
          </View>
        )}

        {/* Shipping Address Section */}
        <View style={styles.sectionDivider} />
        <View style={styles.addressSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.paymentSectionTitle}>Shipping Address</Text>
            <Pressable onPress={() => navigation.navigate('AddressBook')}>
              <Text style={styles.addAddressLink}>Manage Addresses</Text>
            </Pressable>
          </View>

          {savedAddresses.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.addressListScroll}
            >
              {savedAddresses.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.addressCardSm,
                    selectedAddressId === item.id && styles.addressCardSelected
                  ]}
                  onPress={() => setSelectedAddressId(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.addressCardHeader}>
                    <Icon
                      name={item.type === 'Home' ? 'home' : 'briefcase'}
                      size={16}
                      color={selectedAddressId === item.id ? '#1A535C' : '#A0AEC0'}
                    />
                    <Text style={[
                      styles.addressTypeText,
                      selectedAddressId === item.id && styles.addressTextActive
                    ]}>{item.type}</Text>
                    {selectedAddressId === item.id && (
                      <Icon name="check-circle" size={16} color="#1A535C" />
                    )}
                  </View>
                  <Text style={styles.addressNameText} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.addressSnippet} numberOfLines={3}>{item.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Pressable
              style={styles.noAddressPlaceholder}
              onPress={() => navigation.navigate('AddressBook')}
            >
              <Icon name="map-marker-plus-outline" size={24} color="#1A535C" />
              <Text style={styles.noAddressText}>Add a shipping address to continue</Text>
            </Pressable>
          )}
        </View>

        {/* Cashback Banner */}
        <View style={styles.cashbackBanner}>
          <Icon name="tag-outline" size={20} color="#38A169" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cashbackTitle}>Save more with offers</Text>
            <Text style={styles.cashbackSub}>Use UPI for instant discounts & cashback</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Payment Options Header */}
        <Text style={styles.paymentSectionTitle}>Payment Options</Text>

        {/* UPI Row */}
        <TouchableOpacity
          style={[styles.paymentRow, selectedMethod === 'upi' && styles.paymentRowSelected]}
          onPress={() => setSelectedMethod('upi')}
          activeOpacity={0.7}
        >
          <View style={styles.paymentRowLeft}>
            <View style={[styles.paymentRowIcon, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.upiText}>UPI</Text>
            </View>
            <View>
              <Text style={styles.paymentRowTitle}>UPI / Razorpay</Text>
              <Text style={styles.paymentRowSub}>Pay by any UPI app</Text>
              <Text style={styles.paymentRowOffer}>⚡ Fast & secure · Get instant confirmation</Text>
            </View>
          </View>
          <View style={styles.paymentRowRight}>
            <View style={styles.razorpayBadge}>
              <Text style={styles.razorpayText}>RazorPay</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === 'upi' && styles.radioSelected]}>
              {selectedMethod === 'upi' && <View style={styles.radioFill} />}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        {/* COD Row */}
        <TouchableOpacity
          style={[styles.paymentRow, selectedMethod === 'cod' && styles.paymentRowSelected]}
          onPress={() => setSelectedMethod('cod')}
          activeOpacity={0.7}
        >
          <View style={styles.paymentRowLeft}>
            <View style={[styles.paymentRowIcon, { backgroundColor: '#F0FFF4' }]}>
              <Icon name="cash" size={20} color="#38A169" />
            </View>
            <View>
              <Text style={styles.paymentRowTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentRowSub}>Pay when your order arrives</Text>
              <Text style={styles.paymentRowOffer}>No extra charges</Text>
            </View>
          </View>
          <View style={styles.paymentRowRight}>
            <View style={[styles.radioCircle, selectedMethod === 'cod' && styles.radioSelected]}>
              {selectedMethod === 'cod' && <View style={styles.radioFill} />}
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        {/* Footer Tagline */}
        <View style={styles.footerTagline}>
          <Text style={styles.footerTaglineText}>Trusted by 10 Crore+ patients and counting!</Text>
          <Icon name="emoticon-happy-outline" size={28} color="#CBD5E0" style={{ marginTop: 8 }} />
        </View>
      </ScrollView>

      {/* Sticky Confirm Button */}
      <View style={styles.stickyFooter}>
        <Pressable
          style={[styles.confirmButton, !selectedMethod && styles.confirmButtonDisabled]}
          onPress={handleConfirmPayment}
          disabled={!selectedMethod || loading}
        >
          <Icon
            name={selectedMethod === 'cod' ? 'cash-check' : 'shield-check'}
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.confirmButtonText}>
            {loading
              ? 'Processing...'
              : selectedMethod === 'cod'
                ? `Place Order (COD) · ${formatINR(grandTotal)}`
                : selectedMethod === 'upi'
                  ? `Pay ${formatINR(grandTotal)} via UPI`
                  : `Select a Payment Method`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  backButton: { padding: 4 },
  stepLabel: { fontSize: 11, color: '#A0AEC0', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A202C' },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  secureText: { fontSize: 11, color: '#38A169', fontWeight: '700', marginLeft: 4 },

  // Total Banner
  totalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  totalBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  totalBannerLabel: { fontSize: 14, color: '#3182CE', fontWeight: '700' },
  totalBannerAmount: { fontSize: 18, fontWeight: '900', color: '#1A202C' },

  // Breakdown
  breakdownBox: {
    backgroundColor: '#FAFAFA',
    marginHorizontal: 16,
    marginTop: 2,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemIconSm: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  breakdownItemTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  breakdownItemSub: { fontSize: 12, color: '#4ECDC4', fontWeight: '600' },
  breakdownDivider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 8 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  breakdownLabel: { fontSize: 13, color: '#718096' },
  breakdownValue: { fontSize: 13, color: '#2D3748', fontWeight: '700' },
  gstBadge: { backgroundColor: '#EBF8FF', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 6 },
  gstBadgeText: { fontSize: 10, fontWeight: '700', color: '#3182CE' },
  grandTotalLabel: { fontSize: 15, fontWeight: '800', color: '#1A202C' },
  grandTotalValue: { fontSize: 16, fontWeight: '900', color: '#1A535C' },

  // Cashback Banner
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  cashbackTitle: { fontSize: 13, fontWeight: '700', color: '#276749' },
  cashbackSub: { fontSize: 12, color: '#48BB78', marginTop: 2 },

  // Address Section
  addressSection: { paddingBottom: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  addAddressLink: {
    fontSize: 12,
    color: '#1A535C',
    fontWeight: '700',
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addressListScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  addressCardSm: {
    width: 200,
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EDF2F7',
  },
  addressCardSelected: {
    borderColor: '#1A535C',
    backgroundColor: '#F7FFFE',
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTypeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A0AEC0',
    textTransform: 'uppercase',
    marginLeft: 6,
    flex: 1,
  },
  addressTextActive: { color: '#1A535C' },
  addressNameText: { fontSize: 14, fontWeight: '800', color: '#2D3748', marginBottom: 4 },
  addressSnippet: { fontSize: 12, color: '#718096', lineHeight: 16 },
  noAddressPlaceholder: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E0',
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  noAddressText: {
    fontSize: 14,
    color: '#1A535C',
    fontWeight: '600',
    marginTop: 8,
  },

  // Section Divider
  sectionDivider: { height: 8, backgroundColor: '#F7FAFC', marginTop: 16 },
  paymentSectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#A0AEC0',
    textTransform: 'uppercase', letterSpacing: 1.2,
    paddingHorizontal: 16, paddingVertical: 12,
  },

  // Payment Rows
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  paymentRowSelected: { backgroundColor: '#F7FFFE' },
  paymentRowLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  paymentRowIcon: {
    width: 40, height: 40, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  upiText: { fontSize: 11, fontWeight: '900', color: '#6366F1' },
  paymentRowTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C', marginBottom: 2 },
  paymentRowSub: { fontSize: 12, color: '#718096' },
  paymentRowOffer: { fontSize: 11, color: '#38A169', fontWeight: '600', marginTop: 2 },
  paymentRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  razorpayBadge: {
    backgroundColor: '#3395FF', borderRadius: 4,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  razorpayText: { color: 'white', fontSize: 10, fontWeight: '800' },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#CBD5E0',
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: '#1A535C' },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1A535C' },
  rowDivider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 70 },

  // Footer Tagline
  footerTagline: {
    alignItems: 'center', paddingVertical: 28,
  },
  footerTaglineText: { fontSize: 13, color: '#CBD5E0', fontWeight: '500', textAlign: 'center' },

  // Sticky Footer
  stickyFooter: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#1A535C', height: 54, borderRadius: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  confirmButtonDisabled: { backgroundColor: '#CBD5E0', elevation: 0, shadowOpacity: 0 },
  confirmButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },

  // Success Screen
  successScreen: { flex: 1, backgroundColor: 'white' },
  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  successCircle: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center', marginBottom: 32,
  },
  successCircleInner: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#48BB78', justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  successTitle: { fontSize: 32, fontWeight: '900', color: '#1A535C', marginBottom: 12, textAlign: 'center' },
  successSubtitle: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 4 },
  successItemName: { fontSize: 18, fontWeight: '700', color: '#2D3748', textAlign: 'center', marginBottom: 4 },
  successQuantity: { fontSize: 14, color: '#A0AEC0', marginBottom: 24 },
  successAmountBadge: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  successAmountLabel: { fontSize: 12, color: '#A0AEC0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  successAmount: { fontSize: 36, fontWeight: '900', color: '#1A535C' },
  successNote: { fontSize: 13, color: '#A0AEC0', textAlign: 'center', marginBottom: 40 },
  redirectNote: { flexDirection: 'row', alignItems: 'center' },
  redirectText: { fontSize: 13, color: '#CBD5E0', marginLeft: 6 },
});

export default PaymentScreen;
