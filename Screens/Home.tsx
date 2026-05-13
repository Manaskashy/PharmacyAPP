import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, SafeAreaView, Dimensions, Animated, Easing } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FloatingCart from '../Components/FloatingCart';
import FloatingNotifications from '../Components/FloatingNotifications';
import authService from '../Services/authService';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const services = [
  {
    id: 1,
    title: 'Doctor Consultation',
    subtitle: 'Video/Clinic visit',
    icon: 'account-heart',
    color: '#4ECDC4',
  },
  {
    id: 2,
    title: 'Buy Medicine',
    subtitle: 'Prescription drugs',
    icon: 'pill',
    color: '#FF6B6B',
  },
  {
    id: 3,
    title: 'Lab Tests',
    subtitle: 'Book tests at home',
    icon: 'test-tube',
    color: '#45B7D1',
  },
  {
    id: 4,
    title: 'Surgical Supplies',
    subtitle: 'Medical equipment',
    icon: 'hospital-box',
    color: '#F9D423',
  },
  {
    id: 5,
    title: 'First Aid',
    subtitle: 'Emergency kits',
    icon: 'medical-bag',
    color: '#FC913A',
  },
  {
    id: 6,
    title: 'Health Checkup',
    subtitle: 'Full body packages',
    icon: 'heart-pulse',
    color: '#FF4E50',
  },
  {
    id: 7,
    title: 'Ambulance',
    subtitle: 'Emergency booking',
    icon: 'ambulance',
    color: '#E53E3E',
  },
  {
    id: 8,
    title: 'Home Care',
    subtitle: 'Nurses & Physio',
    icon: 'home-heart',
    color: '#38B2AC',
  },
  {
    id: 9,
    title: 'Vitamins',
    subtitle: 'Daily supplements',
    icon: 'pill',
    color: '#ED8936',
  },
  {
    id: 10,
    title: 'Health Vault',
    subtitle: 'Manage records',
    icon: 'folder-heart-outline',
    color: '#4299E1',
  },
];

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getMe();
        setUserData(data.user);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // Header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -85],
    extrapolate: 'clamp',
  });

  const searchScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [60, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[
        styles.stickyHeaderContainer,
        {
          backgroundColor: '#F7FFF7',
          opacity: headerBackgroundOpacity,
        }
      ]} />

      {/* Bottom border animated separately to avoid native driver error */}
      <Animated.View style={[
        styles.headerSeparator,
        {
          opacity: scrollY.interpolate({
            inputRange: [90, 100],
            outputRange: [0, 1],
            extrapolate: 'clamp'
          })
        }
      ]} />

      <View style={styles.container}>
        <Animated.View style={[
          styles.headerMovingContainer,
          { transform: [{ translateY: headerTranslateY }] }
        ]}>
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View>
              <Text style={styles.greeting}>Hello, {userData?.username || 'User'}!</Text>
              <Text style={styles.headerTitle}>Find your medical needs</Text>
            </View>
            <Pressable style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
              <Icon name="account-circle" size={40} color="#1A535C" />
            </Pressable>
          </Animated.View>

          <Animated.View style={[
            styles.searchContainer,
            {
              transform: [
                { translateY: searchTranslateY },
                { scale: searchScale }
              ]
            }
          ]}>
            <Icon name="magnify" size={24} color="#A0AEC0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search medicines, doctors..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A0AEC0"
            />
          </Animated.View>
        </Animated.View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: 180 }]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <Pressable onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.servicesGrid}>
            {services.slice(0, 6).map((service) => (
              <Pressable
                key={service.id}
                style={({ pressed }) => [
                  styles.serviceCard,
                  pressed && styles.cardPressed
                ]}
                onPress={() => {
                  if (service.title === "Doctor Consultation") {
                    navigation.navigate('DoctorConsultant');
                  } else if (service.title === "Buy Medicine") {
                    navigation.navigate('Medicine');
                  } else if (service.title === "Surgical Supplies") {
                    navigation.navigate('SurgicalEquipment');
                  } else if (service.title === "Lab Tests") {
                    navigation.navigate('LabTests');
                  } else if (service.title === "First Aid") {
                    navigation.navigate('FirstAid');
                  } else if (service.title === "Health Checkup") {
                    navigation.navigate('HealthCheckup');
                  } else if (service.title === "Ambulance") {
                    navigation.navigate('Ambulance');
                  } else if (service.title === "Home Care") {
                    navigation.navigate('HomeCare');
                  } else if (service.title === "Vitamins") {
                    navigation.navigate('Vitamins');
                  } else if (service.title === "Health Vault") {
                    navigation.navigate('HealthVault');
                  }
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${service.color}15` }]}>
                  <Icon name={service.icon} size={32} color={service.color} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
              </Pressable>
            ))}
          </View>

          {/* AI MedBot Banner */}
          <Pressable style={styles.aiBanner} onPress={() => navigation.navigate('Chatbot')}>
            <View style={styles.aiBannerLeft}>
              <View style={styles.aiIconRing}>
                <Icon name="robot-excited-outline" size={28} color="#4ECDC4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiBannerTitle}>AI Health Assistant</Text>
                <Text style={styles.aiBannerSubtitle}>Describe symptoms → get insights & medicine suggestions</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="rgba(255,255,255,0.5)" />
          </Pressable>

          <View style={styles.promoCard}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Health Shield</Text>
              <Text style={styles.promoSubtitle}>Get 20% off on your first lab test booking!</Text>
              <Pressable style={styles.promoButton} onPress={() => navigation.navigate('LabTests')}>
                <Text style={styles.promoButtonText}>Book Now</Text>
              </Pressable>
            </View>
            <Icon name="shield-check" size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
          </View>
        </Animated.ScrollView>
        <FloatingNotifications />
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
  stickyHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 10,
  },
  headerSeparator: {
    position: 'absolute',
    top: 89,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
    zIndex: 12,
  },
  headerMovingContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 11,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A535C',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
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
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A535C',
  },
  viewAll: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: 'center',
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#2D3748',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceSubtitle: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
    textAlign: 'center',
  },
  promoCard: {
    backgroundColor: '#1A535C',
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    zIndex: 1,
  },
  promoTitle: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 16,
    maxWidth: '80%',
  },
  promoButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  promoIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },

  // AI MedBot Banner
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1B2D',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.3)',
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiIconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(78,205,196,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(78,205,196,0.35)',
    marginRight: 4,
  },
  aiBannerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  aiBannerSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default HomeScreen;