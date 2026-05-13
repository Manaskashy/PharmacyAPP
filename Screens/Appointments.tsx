import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import appointmentService from '../Services/appointmentService';
import Snackbar from '../Components/Snackbar';

type Tab = 'Doctors' | 'Home Care';

const Appointments = ({ navigation }: { navigation: any }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Doctors');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [homeBookings, setHomeBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorData, homeData] = await Promise.all([
        appointmentService.getMyAppointments(),
        appointmentService.getMyHomeBookings(),
      ]);
      setAppointments(doctorData);
      setHomeBookings(homeData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#718096';
    switch (status.toLowerCase()) {
      case 'scheduled': return '#4299E1';
      case 'completed': return '#48BB78';
      case 'cancelled': return '#F56565';
      default: return '#718096';
    }
  };

  const handleCancelAppointment = (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentService.cancelAppointment(id);
              setSnackbar({ visible: true, message: 'Appointment cancelled successfully', type: 'success' });
              fetchData(); // Refresh list
            } catch (err) {
              setSnackbar({ visible: true, message: 'Failed to cancel appointment', type: 'error' });
            }
          }
        }
      ]
    );
  };

  const renderDoctorAppointment = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);
    const isSelected = selectedAppointmentId === item.id;

    return (
      <Pressable 
        style={[styles.card, isSelected && styles.selectedCard]}
        onLongPress={() => setSelectedAppointmentId(isSelected ? null : item.id)}
        onPress={() => setSelectedAppointmentId(null)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#E6FFFA' }]}>
            <Icon name="doctor" size={24} color="#1A535C" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.Doctor?.name || 'Specialist'}</Text>
            <Text style={styles.specialty}>{item.Doctor?.specialty || 'General Physician'}</Text>
          </View>
          {isSelected ? (
            <TouchableOpacity 
              style={styles.smallCancelBtn} 
              onPress={() => handleCancelAppointment(item.id)}
            >
              <Icon name="close" size={14} color="white" />
              <Text style={styles.smallCancelText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Icon name="calendar-month" size={16} color="#718096" />
            <Text style={styles.infoText}>{item.appointmentDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={16} color="#718096" />
            <Text style={styles.infoText}>{item.timeSlot}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={16} color="#718096" />
            <Text style={styles.infoText}>{item.Doctor?.location || 'Clinic'}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderHomeBooking = ({ item }: { item: any }) => {
    const isSelected = selectedAppointmentId === item.id;
    return (
      <Pressable 
        style={[styles.card, isSelected && styles.selectedCard]}
        onLongPress={() => setSelectedAppointmentId(isSelected ? null : item.id)}
        onPress={() => setSelectedAppointmentId(null)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#F0FFF4' }]}>
            <Icon name="home-heart" size={24} color="#2F855A" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.HomeService?.name || 'Home Service'}</Text>
            <Text style={styles.specialty}>{item.HomeService?.title || 'Physical Visit'}</Text>
          </View>
          {isSelected ? (
            <TouchableOpacity 
              style={styles.smallCancelBtn} 
              onPress={() => {/* In home services we don't have cancel yet, but we enable the UI */}}
            >
              <Text style={styles.smallCancelText}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: '#F0FFF4' }]}>
              <Text style={[styles.statusText, { color: '#2F855A' }]}>Booked</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Icon name="calendar-month" size={16} color="#718096" />
            <Text style={styles.infoText}>{item.bookingDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={16} color="#718096" />
            <Text style={styles.infoText}>{item.timeSlot}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={16} color="#718096" />
            <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color="#1A535C" />
          </TouchableOpacity>
          <Text style={styles.title}>My Appointments</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          {(['Doctors', 'Home Care'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A535C" />
          </View>
        ) : (
          <FlatList
            data={activeTab === 'Doctors' ? appointments : homeBookings}
            renderItem={activeTab === 'Doctors' ? renderDoctorAppointment : renderHomeBooking}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A535C']} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8157/8157053.png' }} 
                  style={styles.emptyImg} 
                />
                <Text style={styles.emptyTitle}>No Bookings Found</Text>
                <Text style={styles.emptySub}>You haven't booked any {activeTab.toLowerCase()} yet.</Text>
                <TouchableOpacity 
                  style={styles.bookNowBtn}
                  onPress={() => navigation.navigate(activeTab === 'Doctors' ? 'DoctorConsultant' : 'HomeCare')}
                >
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            }
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A535C',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#718096',
  },
  activeTabText: {
    color: '#1A535C',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
  },
  specialty: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F7FAFC',
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
    marginLeft: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyImg: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  bookNowBtn: {
    backgroundColor: '#1A535C',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookNowText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  cancelActionText: {
    color: '#E53E3E',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  selectedCard: {
    borderColor: '#E53E3E',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  smallCancelBtn: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 2,
  },
  smallCancelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
});

export default Appointments;
