import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateSlotPickerModal from '../Components/DateSlotPickerModal';
import homecareService, { HomeCareService } from '../Services/homecareservice';
import appointmentService from '../Services/appointmentService';
import { ActivityIndicator } from 'react-native';
import Snackbar from '../Components/Snackbar';

// Interface moved to service file

const HomeCare = ({ navigation }: { navigation: any }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<HomeCareService | null>(null);
  const [services, setServices] = useState<HomeCareService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  React.useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await homecareService.getServices();
      setServices(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching home care services:', err);
      setError('Failed to load services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookVisit = (service: HomeCareService) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const confirmBooking = async (date: string, timeSlot: string) => {
    if (!selectedService) return;
    setConfirmLoading(true);
    try {
      await appointmentService.bookHomeService({
        serviceId: selectedService.id,
        bookingDate: date,
        timeSlot: timeSlot,
        address: 'User Default Address' // In a full app, you'd prompt or select from profile
      });
      setModalVisible(false);
      setSnackbar({ visible: true, message: 'Home care visit booked successfully!', type: 'success' });
      setTimeout(() => navigation.navigate('Home'), 1500); 
    } catch (err: any) {
      console.error('Booking error:', err);
      const msg = err.response?.data?.message || 'Failed to book service. Please try again.';
      setSnackbar({ visible: true, message: msg, type: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  };

  const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('nurse') || n.includes('nursing')) return 'human-female';
    if (n.includes('physio')) return 'human-handsup';
    if (n.includes('sample') || n.includes('collection')) return 'test-tube';
    if (n.includes('caretaker') || n.includes('elderly')) return 'account-heart';
    return 'home-heart';
  };

  const getServiceColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('nurse')) return '#4ECDC4';
    if (n.includes('physio')) return '#45B7D1';
    if (n.includes('sample')) return '#FF6B6B';
    if (n.includes('caretaker')) return '#F9D423';
    return '#4ECDC4';
  };

  const renderServiceCard = ({ item }: { item: HomeCareService }) => {
    const serviceColor = getServiceColor(item.name);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${serviceColor}15` }]}>
            <Icon name={getServiceIcon(item.name)} size={30} color={serviceColor} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.type}>{item.title}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={14} color="#D97706" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <Text style={styles.description}>{item.description || 'Professional home healthcare service provided by verified experts.'}</Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.price}>₹{item.price} / {item.priceUnit}</Text>
            <View style={styles.availabilityRow}>
              <Icon name="calendar-clock" size={14} color="#718096" />
              <Text style={styles.availabilityText}>{item.availability}</Text>
            </View>
          </View>
          <Pressable
            style={styles.bookButton}
            onPress={() => handleBookVisit(item)}
          >
            <Text style={styles.bookButtonText}>Book Visit</Text>
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
            <Text style={styles.title}>Home Healthcare</Text>
            <Text style={styles.subtitle}>Expert medical care at your doorstep</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A535C" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchServices}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={services}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              <View style={styles.promoBanner}>
                <View style={styles.promoContent}>
                  <Text style={styles.promoTitle}>Safe & Trusted</Text>
                  <Text style={styles.promoSubtitle}>All our providers are background checked and verified.</Text>
                </View>
                <Icon name="shield-check" size={60} color="rgba(255,255,255,0.2)" />
              </View>
            }
          />
        )}

        {selectedService && (
          <DateSlotPickerModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={selectedService.name}
            subtitle={selectedService.title}
            accentColor="#1A535C"
            icon={getServiceIcon(selectedService.name)}
            mode="homecare"
            entityId={selectedService.id}
            onConfirm={confirmBooking}
            confirmLoading={confirmLoading}
          />
        )}

        <Snackbar
          visible={snackbar.visible}
          message={snackbar.message}
          type={snackbar.type}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        />
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
  promoBanner: {
    backgroundColor: '#1A535C',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
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
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
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
  type: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A535C',
    marginBottom: 4,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginLeft: 6,
  },
  bookButton: {
    backgroundColor: '#1A535C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
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

export default HomeCare;
