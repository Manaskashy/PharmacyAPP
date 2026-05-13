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
import medicineService, { Medicine } from '../Services/medicineservice';
import { ActivityIndicator } from 'react-native';

const BuyMedicine = ({ navigation }: { navigation: any }) => {
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getMedicines();
      setMedicines(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to load medicines. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPress = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setModalVisible(true);
  };

  const confirmAdd = (quantity: number) => {
    // Handle add to cart logic here
    console.log(`Added to cart: ${quantity}x ${selectedMedicine?.name}`);
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMedicineCard = ({ item }: { item: Medicine }) => {
    const inStock = item.availability === 'In Stock';
    return (
      <View style={styles.medicineCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: inStock ? '#F0FDF4' : '#FFF5F5' }]}>
            <Icon name="pill" size={32} color={inStock ? '#10B981' : '#EF4444'} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <Text style={styles.medicineCategory}>{item.category}</Text>
          </View>
          <Text style={styles.medicinePrice}>₹{item.price}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description || 'No description available'}</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={14} color="#718096" />
            <Text style={styles.detailText}>{item.dosage || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="factory" size={14} color="#718096" />
            <Text style={styles.detailText}>{item.manufacturer || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.stockBadge, { backgroundColor: inStock ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[styles.stockText, { color: inStock ? '#166534' : '#991B1B' }]}>
              {item.availability}
            </Text>
          </View>
          <Pressable
            style={[styles.addButton, !inStock && styles.disabledButton]}
            disabled={!inStock}
            onPress={() => handleAddPress(item)}
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
            <Text style={styles.title}>Medicines</Text>
            <Text style={styles.subtitle}>240+ Products Available</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for medicines..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading medicines...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchMedicines}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredMedicines}
            renderItem={renderMedicineCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="pill-off" size={64} color="#E2E8F0" />
                <Text style={styles.emptyText}>No medicines found</Text>
              </View>
            }
          />
        )}

        {selectedMedicine && (
          <ActionModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={selectedMedicine.name}
            subtitle={selectedMedicine.category}
            price={`₹${selectedMedicine.price}`}
            description={(selectedMedicine.description || '') + ' ' + (selectedMedicine.dosage || '')}
            icon="pill"
            iconColor={selectedMedicine.availability === 'In Stock' ? '#10B981' : '#EF4444'}
            buttonLabel="Buy Now"
            secondaryButtonLabel="Add to Cart"
            onAction={(qty) => console.log('Buying now:', qty)}
            onSecondaryAction={confirmAdd}
            showQuantity={true}
            navigation={navigation}
            productId={selectedMedicine.id}
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
  medicineCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  medicineCategory: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  medicinePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A535C',
  },
  description: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#718096',
    marginLeft: 6,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A535C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
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
});

export default BuyMedicine;
