import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionModal from '../Components/ActionModal';
import { useCart } from '../Context/CartContext';
import FloatingCart from '../Components/FloatingCart';
import vitaminService, { VitaminProduct } from '../Services/vitaminservice';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 52) / 2;

// Interface moved to service file

const Vitamins = ({ navigation }: { navigation: any }) => {
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VitaminProduct | null>(null);
  const [products, setProducts] = useState<VitaminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await vitaminService.getVitamins();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching vitamins:', err);
      setError('Failed to load vitamins. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (product: VitaminProduct) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const confirmPurchase = (quantity: number) => {
    // Handle purchase logic
    console.log(`Purchase confirmed: ${quantity}x ${selectedProduct?.name}`);
  };

  const getVitaminIcon = (name: string, category: string) => {
    const n = name.toLowerCase();
    const c = category.toLowerCase();
    if (n.includes('d3') || c.includes('bone')) return 'bone';
    if (n.includes('omega') || c.includes('heart')) return 'heart-pulse';
    if (n.includes('vitamin c') || c.includes('immunity')) return 'shield-check';
    if (n.includes('zinc') || n.includes('magnesium') || c.includes('muscle')) return 'arm-flex';
    if (n.includes('b-complex') || c.includes('energy')) return 'flash';
    return 'pill';
  };

  const getVitaminColor = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('bone')) return '#45B7D1';
    if (c.includes('heart')) return '#FF6B6B';
    if (c.includes('immunity')) return '#4ECDC4';
    if (c.includes('muscle')) return '#FC913A';
    if (c.includes('energy')) return '#9F7AEA';
    return '#4ECDC4';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductItem = ({ item }: { item: VitaminProduct }) => {
    const vitaminColor = getVitaminColor(item.category);
    const vitaminIcon = getVitaminIcon(item.name, item.category);

    return (
      <View style={styles.productCard}>
        <View style={[styles.imageContainer, { backgroundColor: `${vitaminColor}10` }]}>
          <Icon name={vitaminIcon} size={48} color={vitaminColor} />
          <View style={styles.ratingBadge}>
            <Icon name="star" size={12} color="#D97706" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.brandName}>{item.manufacturer || 'General'}</Text>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.categoryName}>{item.category}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{item.price}</Text>
            <Pressable 
              style={styles.buyButton}
              onPress={() => handleBuyNow(item)}
            >
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#1A535C" />
            </Pressable>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Vitamins Store</Text>
              <Text style={styles.subtitle}>Pure and effective supplements</Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="magnify" size={22} color="#A0AEC0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vitamins, omega, calcium..."
              placeholderTextColor="#A0AEC0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A535C" />
            <Text style={styles.loadingText}>Loading vitamins...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchProducts}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
          />
        )}

        {selectedProduct && (
          <ActionModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={selectedProduct.name}
            subtitle={selectedProduct.manufacturer || 'General'}
            price={`₹${selectedProduct.price}`}
            description={`${selectedProduct.description || ''}\n\nDosage: ${selectedProduct.dosage || 'N/A'}`}
            icon={getVitaminIcon(selectedProduct.name, selectedProduct.category)}
            iconColor={getVitaminColor(selectedProduct.category)}
            buttonLabel="Buy Now"
            secondaryButtonLabel="Add to Cart"
            onAction={(qty) => console.log('Buying now:', qty)}
            onSecondaryAction={confirmPurchase}
            showQuantity={true}
            navigation={navigation}
            productId={selectedProduct.id}
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
    backgroundColor: '#F7FFF7',
    paddingBottom: 4,
  },
  headerTop: {
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
    paddingHorizontal: 48,
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
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    elevation: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 3,
  },
  productInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A535C',
  },
  buyButton: {
    backgroundColor: '#1A535C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
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
    backgroundColor: '#1A535C',
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

export default Vitamins;
