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
import FloatingCart from '../Components/FloatingCart';
import firstaidService, { FirstAidItem } from '../Services/firstaidservice';
import { ActivityIndicator } from 'react-native';

// Interface moved to service file

const FirstAid = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FirstAidItem | null>(null);
  const [items, setItems] = useState<FirstAidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await firstaidService.getItems();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching first aid items:', err);
      setError('Failed to load first aid items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: FirstAidItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const confirmAdd = (quantity: number) => {
    // Handle add to kit logic
    console.log(`Added to kit: ${quantity}x ${selectedItem?.name}`);
  };

  const getIconForItem = (name: string, category: string) => {
    const n = name.toLowerCase();
    const c = category.toLowerCase();
    if (n.includes('bandage')) return 'bandage';
    if (n.includes('cream') || n.includes('ointment')) return 'cream';
    if (n.includes('thermometer')) return 'thermometer';
    if (n.includes('gauze') || n.includes('pad')) return 'checkbox-blank-square-outline';
    if (n.includes('scissor')) return 'content-cut';
    if (n.includes('cold') || n.includes('ice')) return 'snowflake';
    if (c.includes('emergency')) return 'alert-circle-outline';
    return 'medical-bag';
  };

  const filteredFirstAid = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFirstAidCard = ({ item }: { item: FirstAidItem }) => {
    const inStock = item.availability === 'In Stock';
    const itemIcon = getIconForItem(item.name, item.category);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: inStock ? '#FFF5F5' : '#F7FAFC' }]}>
            <Icon name={itemIcon} size={32} color={inStock ? '#EF4444' : '#A0AEC0'} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{item.description || 'Essential supplies for your first aid kit.'}</Text>
        
        <View style={styles.detailsRow}>
          <Icon name="factory" size={14} color="#718096" />
          <Text style={styles.detailLabel}>Mfr:</Text>
          <Text style={styles.detailValue}>{item.manufacturer || 'General'}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.stockBadge, { backgroundColor: inStock ? '#FEE2E2' : '#F7FAFC' }]}>
            <Text style={[styles.stockText, { color: inStock ? '#991B1B' : '#718096' }]}>
              {inStock ? 'Ready for Dispatch' : item.availability}
            </Text>
          </View>
          <Pressable 
            style={[styles.addButton, !inStock && styles.disabledButton]}
            disabled={!inStock}
            onPress={() => handleAddItem(item)}
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
            <Text style={styles.title}>First Aid Kit</Text>
            <Text style={styles.subtitle}>Essential emergency supplies</Text>
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
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.loadingText}>Loading supplies...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchItems}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredFirstAid}
            renderItem={renderFirstAidCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="bandage" size={64} color="#E2E8F0" />
                <Text style={styles.emptyText}>No items found</Text>
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
            icon={getIconForItem(selectedItem.name, selectedItem.category)}
            iconColor={selectedItem.availability === 'In Stock' ? '#EF4444' : '#718096'}
            buttonLabel="Buy Now"
            secondaryButtonLabel="Add to Cart"
            onAction={(qty) => console.log('Buying now:', qty)}
            onSecondaryAction={confirmAdd}
            showQuantity={true}
            navigation={navigation}
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
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  price: {
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
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  detailLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 6,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
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
    backgroundColor: '#EF4444',
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
    backgroundColor: '#EF4444',
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

export default FirstAid;