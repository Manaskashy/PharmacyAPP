import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  SafeAreaView, 
  TextInput,
  Dimensions
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FloatingCart from '../Components/FloatingCart';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const CATEGORIES = [
  {
    id: 'consultation',
    title: 'Medical Consultation',
    icon: 'account-group',
    color: '#4ECDC4',
    items: [
      { id: 1, title: 'Doctor Consultation', subtitle: 'Video/Clinic visit', icon: 'account-heart', color: '#4ECDC4', route: 'DoctorConsultant' },
      { id: 8, title: 'Home Care', subtitle: 'Nurses & Physio', icon: 'home-heart', color: '#38B2AC', route: 'HomeCare' },
    ]
  },
  {
    id: 'shop',
    title: 'Medical Shop',
    icon: 'shopping',
    color: '#FF6B6B',
    items: [
      { id: 2, title: 'Buy Medicine', subtitle: 'Prescription drugs', icon: 'pill', color: '#FF6B6B', route: 'Medicine' },
      { id: 4, title: 'Surgical Supplies', subtitle: 'Medical equipment', icon: 'hospital-box', color: '#F9D423', route: 'SurgicalEquipment' },
      { id: 9, title: 'Vitamins', subtitle: 'Daily supplements', icon: 'pill', color: '#ED8936', route: 'Vitamins' },
      { id: 5, title: 'First Aid', subtitle: 'Emergency kits', icon: 'medical-bag', color: '#FC913A', route: 'FirstAid' },
    ]
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics',
    icon: 'microscope',
    color: '#45B7D1',
    items: [
      { id: 3, title: 'Lab Tests', subtitle: 'Book tests at home', icon: 'test-tube', color: '#45B7D1', route: 'LabTests' },
      { id: 6, title: 'Health Checkup', subtitle: 'Full body packages', icon: 'heart-pulse', color: '#FF4E50', route: 'HealthCheckup' },
    ]
  },
  {
    id: 'support',
    title: 'Support & Records',
    icon: 'lifebuoy',
    color: '#4299E1',
    items: [
      { id: 7, title: 'Ambulance', subtitle: 'Emergency booking', icon: 'ambulance', color: '#E53E3E', route: 'Ambulance' },
      { id: 10, title: 'Health Vault', subtitle: 'Manage records', icon: 'folder-heart-outline', color: '#4299E1', route: 'HealthVault' },
    ]
  }
];

const CategoriesScreen = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#1A535C" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>All Services</Text>
            <Text style={styles.subtitle}>Explore all medical facilities</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search for a service..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#A0AEC0"
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filteredCategories.map((category) => (
            <View key={category.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: `${category.color}15` }]}>
                  <Icon name={category.icon} size={20} color={category.color} />
                </View>
                <Text style={styles.sectionTitle}>{category.title}</Text>
              </View>
              
              <View style={styles.grid}>
                {category.items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.card,
                      pressed && styles.cardPressed
                    ]}
                    onPress={() => navigation.navigate(item.route)}
                  >
                    <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                      <Icon name={item.icon} size={28} color={item.color} />
                    </View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
          
          {filteredCategories.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="magnify-close" size={64} color="#E2E8F0" />
              <Text style={styles.emptyText}>No services match your search</Text>
            </View>
          )}
        </ScrollView>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F7FAFC',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
  },
  emptyState: {
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

export default CategoriesScreen;
