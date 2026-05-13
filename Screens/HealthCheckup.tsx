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
import healthcheckupService, { HealthPackage } from '../Services/healthcheckupservice';
import { ActivityIndicator } from 'react-native';


// Interface moved to service file

const HealthCheckup = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<HealthPackage | null>(null);
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await healthcheckupService.getPackages();
      setPackages(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching health packages:', err);
      setError('Failed to load health packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookPackage = (pkg: HealthPackage) => {
    setSelectedPackage(pkg);
    setModalVisible(true);
  };

  const confirmBooking = (quantity: number) => {
    // Handle booking logic
    console.log(`Package booked: ${selectedPackage?.name}`);
  };

  const getPackageIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('comprehensive')) return 'shield-account';
    if (cat.includes('diabetes')) return 'water';
    if (cat.includes('cardiac')) return 'heart-pulse';
    if (cat.includes('hormonal')) return 'butterfly';
    if (cat.includes('kidney')) return 'opacity';
    return 'bottle-tonic-plus';
  };

  const getPackageColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('comprehensive')) return '#4ECDC4';
    if (cat.includes('diabetes')) return '#FF6B6B';
    if (cat.includes('cardiac')) return '#FF4E50';
    if (cat.includes('hormonal')) return '#45B7D1';
    return '#4ECDC4';
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPackageCard = ({ item }: { item: HealthPackage }) => {
    const pkgColor = getPackageColor(item.category);
    const inStock = item.availability === 'Available';
    const testsStr = item.includesTests?.join(', ') || 'Various diagnostic tests';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${pkgColor}15` }]}>
            <Icon name={getPackageIcon(item.category)} size={32} color={pkgColor} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <Text style={styles.description}>{item.description || 'Complete health screening package for comprehensive wellness monitoring.'}</Text>

        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Includes {item.includesTests?.length || 0} Tests:</Text>
          <Text style={styles.tests}>{testsStr}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.providerInfo}>
              <Icon name="hospital-building" size={14} color="#718096" />
              <Text style={styles.providerName}>{item.labName || 'Medicare Labs'}</Text>
            </View>
            <View style={[styles.stockBadge, { backgroundColor: inStock ? '#E6FFFA' : '#FFF5F5' }]}>
              <Text style={[styles.stockText, { color: inStock ? '#2C7A7B' : '#C53030' }]}>
                {item.availability}
              </Text>
            </View>
          </View>
          <Pressable
            style={[styles.bookButton, !inStock && styles.disabledButton]}
            disabled={!inStock}
            onPress={() => handleBookPackage(item)}
          >
            <Icon name="cart-plus" size={18} color="white" />
            <Text style={styles.bookButtonText}>Add</Text>
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
            <Text style={styles.title}>Health Packages</Text>
            <Text style={styles.subtitle}>Preventive diagnostics for you</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search packages..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading packages...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchPackages}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredPackages}
            renderItem={renderPackageCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        {selectedPackage && (
          <ActionModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={selectedPackage.name}
            subtitle={selectedPackage.category}
            price={`₹${selectedPackage.price}`}
            description={`${selectedPackage.description || 'Comprehensive health checkup package.'}\n\nIncludes: ${selectedPackage.includesTests?.join(', ') || 'N/A'}`}
            icon={getPackageIcon(selectedPackage.category)}
            iconColor={getPackageColor(selectedPackage.category)}
            buttonLabel="Buy Now"
            secondaryButtonLabel="Add to Cart"
            onAction={(qty) => console.log('Buying now:', qty)}
            onSecondaryAction={confirmBooking}
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
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '700',
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A535C',
  },
  description: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 16,
  },
  testSection: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  testTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 4,
  },
  tests: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  footerLeft: {
    gap: 6,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 6,
    fontWeight: '600',
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A535C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  bookButtonText: {
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
});

export default HealthCheckup;
