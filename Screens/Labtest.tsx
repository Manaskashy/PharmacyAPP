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
import labtestService, { LabTest } from '../Services/labtestservice';
import { ActivityIndicator } from 'react-native';


// Interface moved to service file

const LabTests = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const data = await labtestService.getLabTests();
      setTests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching lab tests:', err);
      setError('Failed to load lab tests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTest = (test: LabTest) => {
    setSelectedTest(test);
    setModalVisible(true);
  };

  const confirmSelection = (quantity: number) => {
    // Handle selection logic here
    console.log(`Test selected: ${selectedTest?.name}`);
  };

  const getIconForTest = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('blood')) return 'water-outline';
    if (cat.includes('thyroid')) return 'butterfly';
    if (cat.includes('imaging')) return 'radiology-box';
    if (cat.includes('liver')) return 'microscope';
    if (cat.includes('sugar')) return 'water-percent';
    return 'test-tube';
  };

  const getTestColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('blood')) return '#6B46C1';
    if (cat.includes('thyroid')) return '#9F7AEA';
    if (cat.includes('imaging')) return '#44337A';
    if (cat.includes('liver')) return '#805AD5';
    if (cat.includes('sugar')) return '#B794F4';
    return '#6B46C1';
  };

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLabTestCard = ({ item }: { item: LabTest }) => {
    const testColor = getTestColor(item.category || item.type);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${testColor}15` }]}>
            <Icon name={getIconForTest(item.category || item.type)} size={30} color={testColor} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.typeBadge}>
              <Text style={[styles.typeText, { color: testColor }]}>{item.category || item.type}</Text>
            </View>
          </View>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description || 'No description available'}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={14} color="#A0AEC0" />
              <Text style={styles.infoText}>Report in {item.reportTime || '24 hours'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="hospital-building" size={14} color="#A0AEC0" />
              <Text style={styles.infoText} numberOfLines={1}>{item.labName || 'City Labs'}</Text>
            </View>
          </View>
          <Pressable
            style={styles.bookButton}
            onPress={() => handleSelectTest(item)}
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
            <Text style={styles.title}>Lab Diagnostics</Text>
            <Text style={styles.subtitle}>Precise results, expert care</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search diagnostics..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading tests...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchLabTests}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredTests}
            renderItem={renderLabTestCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        {selectedTest && (
          <ActionModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={selectedTest.name}
            subtitle={selectedTest.category || selectedTest.type}
            price={`₹${selectedTest.price}`}
            description={(selectedTest.description || '') + (selectedTest.reportTime ? `\nReport Time: ${selectedTest.reportTime}` : '')}
            icon={getIconForTest(selectedTest.category || selectedTest.type)}
            iconColor={getTestColor(selectedTest.category || selectedTest.type)}
            buttonLabel="Buy Now"
            secondaryButtonLabel="Add to Cart"
            onAction={(qty) => console.log('Buying now:', qty)}
            onSecondaryAction={confirmSelection}
            navigation={navigation}
            productId={selectedTest.id}
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
    borderWidth: 1,
    borderColor: '#EDF2F7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F7FAFC',
  },
  typeText: {
    fontSize: 11,
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
    marginBottom: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 6,
    fontWeight: '500',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#44337A',
    gap: 6,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 13,
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

export default LabTests;
