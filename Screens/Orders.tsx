import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FloatingCart from '../Components/FloatingCart';
import orderService, { Order } from '../Services/orderservice';


const Orders = ({ navigation }: { navigation: any }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#48BB78';
      case 'shipped': return '#4299E1';
      case 'pending': return '#ECC94B';
      case 'cancelled': return '#F56565';
      default: return '#718096';
    }
  };

  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'medicine': return 'pill';
      case 'equipment': return 'hospital-box';
      case 'vitamin': return 'medical-bag';
      case 'labtest': return 'flask-outline';
      default: return 'package-variant-closed';
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const mainProduct = item.OrderItems?.[0]?.Product;
    const itemsCount = item.OrderItems?.length || 0;
    const itemsLabel = itemsCount > 1 
      ? `${mainProduct?.name} + ${itemsCount - 1} more`
      : mainProduct?.name || 'Order Details';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#F0F9FA' }]}>
            <Icon name={getIconForType(mainProduct?.type || '')} size={26} color="#1A535C" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.orderNumber}>ORD-{item.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.cardBody}>
          <Icon name="basket-outline" size={18} color="#A0AEC0" />
          <Text style={styles.itemsLabel} numberOfLines={1}>{itemsLabel}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
          <Pressable 
            style={styles.detailsBtn}
            onPress={() => navigation.navigate('OrderTracking', { order: item })}
          >
            <Text style={styles.detailsBtnText}>Track</Text>
            <Icon name="chevron-right" size={16} color="#1A535C" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#1A535C" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>My Orders</Text>
            <Text style={styles.subtitle}>Track and manage your history</Text>
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A535C" />
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A535C']} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="package-variant-closed" size={64} color="#E2E8F0" />
                <Text style={styles.emptyText}>No orders yet</Text>
              </View>
            }
          />
        )}
        <FloatingCart />
      </View>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FFF7',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
    position: 'relative',
    minHeight: 64,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A535C',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F7FAFC',
    marginBottom: 16,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsLabel: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  totalLabel: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A535C',
    marginLeft: 8,
    flex: 1,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A535C',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Orders;
