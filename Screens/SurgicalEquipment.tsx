import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionModal from '../Components/ActionModal';
import { useCart } from '../Context/CartContext';
import FloatingCart from '../Components/FloatingCart';
import surgicalEquipmentService, { Equipment } from '../Services/surgicalequipmentservice';
import { ActivityIndicator } from 'react-native';

const SurgicalEquipment = ({ navigation }: { navigation: any }) => {
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await surgicalEquipmentService.getEquipment();
      setEquipment(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching surgical equipment:', err);
      setError('Failed to load surgical equipment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (item: Equipment) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const confirmPurchase = (quantity: number) => {
    // Handle purchase logic here
    console.log(`Purchase confirmed: ${quantity}x ${selectedItem?.name}`);
  };

  const getIconForCategory = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('diagnostic')) return 'stethoscope';
    if (cat.includes('surgical')) return 'knife';
    if (cat.includes('monitor')) return 'heart-pulse';
    if (cat.includes('consumable')) return 'needle';
    if (cat.includes('mobility')) return 'wheelchair-accessibility';
    return 'hospital-box';
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEquipmentCard = ({ item }: { item: Equipment }) => {
    const inStock = item.availability === 'In Stock';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Icon name={getIconForCategory(item.category)} size={30} color="#1A535C" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description || 'No description available'}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="factory" size={14} color="#A0AEC0" />
            <Text style={styles.metaText}>{item.manufacturer || 'Unknown Manufacturer'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.stockBadge, { backgroundColor: inStock ? '#E6FFFA' : '#FFF5F5' }]}>
            <Text style={[styles.stockText, { color: inStock ? '#2C7A7B' : '#C53030' }]}>
              {item.availability}
            </Text>
          </View>
          <Pressable
            style={[styles.addButton, !inStock && styles.disabledButton]}
            disabled={!inStock}
            onPress={() => handlePurchase(item)}
          >
            <Icon name="cart-plus" size={18} color="white" />
            <Text style={styles.addButtonText}>Add</Text>
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
            <Text style={styles.title}>Surgical Tools</Text>
            <Text style={styles.subtitle}>Hospital grade medical equipment</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading equipment...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchEquipment}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredEquipment}
            renderItem={renderEquipmentCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="package-variant-closed" size={64} color="#E2E8F0" />
                <Text style={styles.emptyText}>No equipment found</Text>
              </View>
            }
          />
        )}

        {selectedItem && (
          <ActionModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={selectedItem.name}
            subtitle={selectedItem.category}
            price={`₹${selectedItem.price}`}
            description={selectedItem.description || ''}
            icon={getIconForCategory(selectedItem.category)}
            buttonLabel="Buy Now"
            secondaryButtonLabel="Add to Cart"
            onAction={(qty) => console.log('Buying now:', qty)}
            onSecondaryAction={confirmPurchase}
            showQuantity={true}
            navigation={navigation}
            productId={selectedItem.id}
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
    fontSize: 24,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F0F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A535C',
  },
  description: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 6,
    fontWeight: '600',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A535C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '600',
  },
});

export default SurgicalEquipment;
