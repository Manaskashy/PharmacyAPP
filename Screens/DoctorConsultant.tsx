import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateSlotPickerModal from '../Components/DateSlotPickerModal';
import doctorService from '../Services/doctorService';
import appointmentService from '../Services/appointmentService';
import Snackbar from '../Components/Snackbar';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  patientCount: string;
  experience: number;
  location: string;
  fees: number;
  image: string | null;
  biography: string | null;
  education: string[];
  languages: string[];
  color?: string; // UI only
  icon?: string; // UI only
}

const DoctorConsultant = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctors();
      const transformed: Doctor[] = data.map(item => ({
        ...item,
        color: getSpecialtyColor(item.specialty),
        icon: 'doctor'
      }));
      setDoctors(transformed);
      setError(null);
    } catch (err) {
      console.error('Fetch doctors error:', err);
      setError('Failed to load specialists');
    } finally {
      setLoading(false);
    }
  };

  const getSpecialtyColor = (spec: string) => {
    const s = spec.toLowerCase();
    if (s.includes('heart') || s.includes('cardio')) return '#FF6B6B';
    if (s.includes('brain') || s.includes('neuro')) return '#45B7D1';
    if (s.includes('child') || s.includes('pediat')) return '#4ECDC4';
    if (s.includes('bone') || s.includes('ortho')) return '#FFA07A';
    return '#9B59B6';
  };

  const handleBookNow = (doctor: Doctor) => {
    console.log('Opening booking for:', doctor.name);
    setSelectedDoctor(doctor);
    setProfileVisible(false); // Close profile if open
    setModalVisible(true);
  };

  const handleViewProfile = (doctor: Doctor) => {
    console.log('Opening profile for:', doctor.name);
    setSelectedDoctor(doctor);
    setModalVisible(false); // Close booking if open
    setProfileVisible(true);
  };

  const confirmBooking = async (date: string, timeSlot: string) => {
    if (!selectedDoctor) return;
    setConfirmLoading(true);
    try {
      await appointmentService.bookAppointment({
        doctorId: selectedDoctor.id,
        appointmentDate: date,
        timeSlot: timeSlot,
        type: 'clinic' // video or clinic to match backend ENUM
      });
      setModalVisible(false);
      setSnackbar({ visible: true, message: 'Appointment booked successfully!', type: 'success' });
      setTimeout(() => navigation.navigate('Home'), 1500); // Small delay to show snackbar
    } catch (err: any) {
      console.error('Booking error:', err);
      const msg = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      setSnackbar({ visible: true, message: msg, type: 'error' });
    } finally {
      setConfirmLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: `${item.color || '#4ECDC4'}15` }]}>
          <Icon name={item.icon || 'doctor'} size={40} color={item.color || '#4ECDC4'} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <View style={styles.specializationBadge}>
            <Text style={styles.specializationText}>{item.specialty}</Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Icon name="star" size={14} color="#F9D423" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Icon name="briefcase-outline" size={16} color="#718096" />
          <Text style={styles.infoLabel}>Experience:</Text>
          <Text style={styles.infoValue}>{item.experience} years</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="map-marker-outline" size={16} color="#718096" />
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="hand-coin-outline" size={16} color="#718096" />
          <Text style={styles.infoLabel}>Cons. Fee:</Text>
          <Text style={[styles.infoValue, { color: '#2D3748', fontWeight: '800' }]}>₹{item.fees}</Text>
        </View>
        <View style={styles.availabilityTag}>
          <Icon name="clock-outline" size={14} color="#4ECDC4" />
          <Text style={styles.availabilityText}>Available: Today, 04:30 PM</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => handleViewProfile(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.secondaryButtonText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => handleBookNow(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.primaryButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#1A535C" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Specialists</Text>
            <Text style={styles.subtitle}>Book top-rated doctors online</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or specialty..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#A0AEC0" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A535C" />
            <Text style={styles.loadingText}>Fetching specialists...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={64} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredDoctors}
            renderItem={renderDoctorCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-search-outline" size={64} color="#E2E8F0" />
                <Text style={styles.emptyText}>No specialists found</Text>
              </View>
            }
          />
        )}

        {selectedDoctor && (
          <>
            <DateSlotPickerModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title={selectedDoctor.name}
              subtitle={selectedDoctor.specialty}
              accentColor="#1A535C"
              icon={selectedDoctor.icon || 'doctor'}
              mode="doctor"
              entityId={selectedDoctor.id}
              onConfirm={confirmBooking}
              confirmLoading={confirmLoading}
            />

            <DoctorProfileModal
              visible={profileVisible}
              onCloseRequest={() => setProfileVisible(false)}
              doctor={selectedDoctor}
              onBook={() => {
                setProfileVisible(false);
                setModalVisible(true);
              }}
            />
          </>
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

const DoctorProfileModal = ({
  visible,
  onCloseRequest,
  doctor,
  onBook
}: {
  visible: boolean,
  onCloseRequest: () => void,
  doctor: Doctor | null,
  onBook: () => void
}) => {
  if (!doctor) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCloseRequest}
    >
      <View style={styles.profileOverlay}>
        <TouchableOpacity 
          style={styles.profileDismiss} 
          onPress={onCloseRequest} 
          activeOpacity={1} 
        />
        <View style={styles.profileContent}>
          <View style={styles.profileDragHandle} />

          <ScrollView
            style={styles.profileScrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.profileScrollContent}
          >
            <View style={styles.profileHeader}>
              <View style={[styles.profileAvatarLarge, { backgroundColor: `${doctor.color || '#4ECDC4'}15` }]}>
                <Icon name={doctor.icon || 'doctor'} size={60} color={doctor.color || '#4ECDC4'} />
              </View>
              <View style={styles.profileHeaderInfo}>
                <Text style={styles.profileDoctorName}>{doctor.name}</Text>
                <Text style={styles.profileSpecText}>{doctor.specialty}</Text>
                <View style={styles.profileRatingRow}>
                  <Icon name="star" size={16} color="#F9D423" />
                  <Text style={styles.profileRatingValue}>{doctor.rating}</Text>
                  <Text style={styles.profileReviewCount}>({doctor.reviewCount} reviews)</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{doctor.patientCount}</Text>
                <Text style={styles.statLabel}>Patients</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{doctor.experience}Yrs</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>₹{doctor.fees}</Text>
                <Text style={styles.statLabel}>Cons. Fee</Text>
              </View>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.profileSectionTitle}>Biography</Text>
              <Text style={styles.profileBioText}>{doctor.biography || 'No biography available.'}</Text>
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.profileSectionTitle}>Education</Text>
              {doctor.education?.map((edu, index) => (
                <View key={index} style={styles.eduItem}>
                  <Icon name="medal-outline" size={18} color={doctor.color || '#4ECDC4'} />
                  <Text style={styles.eduText}>{edu}</Text>
                </View>
              ))}
            </View>

            <View style={styles.profileSection}>
              <Text style={styles.profileSectionTitle}>Languages</Text>
              <View style={styles.langRow}>
                {doctor.languages?.map((lang, index) => (
                  <View key={index} style={styles.langBadge}>
                    <Text style={styles.langText}>{lang}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.profileFooter}>
            <TouchableOpacity 
              style={[styles.profileBookBtn, { backgroundColor: doctor.color || '#1A535C' }]} 
              onPress={onBook}
            >
              <Text style={styles.profileBookBtnText}>Schedule Consultation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  clearButton: {
    padding: 4,
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
  doctorCard: {
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
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 4,
  },
  specializationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specializationText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  infoGrid: {
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F7FAFC',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: '#A0AEC0',
    width: 85,
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '600',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A535C',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1A535C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  availabilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: '#2F855A',
    fontWeight: '700',
    marginLeft: 8,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  // Profile Modal Styles
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  profileDismiss: {
    flex: 1,
  },
  profileContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingBottom: 34,
    height: '85%',
  },
  profileDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 12,
  },
  profileCloseBtn: {
    position: 'absolute',
    right: 24,
    top: 24,
    zIndex: 10,
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  profileAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileDoctorName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A535C',
    marginBottom: 4,
  },
  profileSpecText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '700',
    marginBottom: 8,
  },
  profileRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileRatingValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D3748',
    marginLeft: 4,
  },
  profileScrollContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileReviewCount: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F7FFF7',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6FFEB',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A535C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  profileScrollArea: {
    flex: 1,
  },
  profileSection: {
    marginBottom: 24,
  },
  profileSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A535C',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  profileBioText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 24,
    fontWeight: '500',
  },
  eduItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eduText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 12,
    fontWeight: '500',
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  langBadge: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langText: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '600',
  },
  profileFooter: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  profileBookBtn: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  profileBookBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1A535C',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#1A535C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default DoctorConsultant;