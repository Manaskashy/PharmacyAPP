import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import authService from '../Services/authService';
import orderService from '../Services/orderservice';
import appointmentService from '../Services/appointmentService';

const Profile = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes, appointmentsRes, homeBookingsRes] = await Promise.all([
          authService.getMe(),
          orderService.getMyOrders(),
          appointmentService.getMyAppointments(),
          appointmentService.getMyHomeBookings(),
        ]);
        setUserData(profileRes.user);
        setOrderCount(ordersRes.length);
        setAppointmentCount((appointmentsRes?.length || 0) + (homeBookingsRes?.length || 0));
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.navigate('Login') },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    { id: '1', title: 'My Orders', icon: 'package-variant-closed', color: '#1A535C' },
    { id: '7', title: 'My Appointments', icon: 'calendar-check', color: '#4ECDC4' },
    { id: '2', title: 'Medical Records', icon: 'file-document-outline', color: '#45B7D1' },
    { id: '3', title: 'Address Book', icon: 'map-marker-outline', color: '#FF6B6B' },
    { id: '4', title: 'Payment Methods', icon: 'credit-card-outline', color: '#4ECDC4' },
    { id: '5', title: 'Insurance Details', icon: 'shield-check-outline', color: '#96CEB4' },
    { id: '6', title: 'Settings', icon: 'cog-outline', color: '#718096' },
  ];

  const MenuItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.menuItem}
      onPress={() => {
        if (item.title === 'My Orders') {
          navigation.navigate('Orders');
        } else if (item.title === 'My Appointments') {
          navigation.navigate('Appointments');
        } else if (item.title === 'Medical Records') {
          navigation.navigate('HealthVault');
        } else if (item.title === 'Address Book') {
          navigation.navigate('AddressBook');
        } else if (item.title === 'Payment Methods') {
          navigation.navigate('PaymentMethods');
        } else if (item.title === 'Insurance Details') {
          navigation.navigate('InsuranceDetails');
        } else if (item.title === 'Settings') {
          navigation.navigate('Settings');
        }
      }}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
        <Icon name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.menuTitle}>{item.title}</Text>
      <Icon name="chevron-right" size={20} color="#CBD5E0" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Icon name="account" size={60} color="#1A535C" />
            </View>
            <Pressable style={styles.editButton}>
              <Icon name="pencil" size={16} color="white" />
            </Pressable>
          </View>
          <Text style={styles.userName}>{userData?.username || 'Loading...'}</Text>
          <Text style={styles.userEmail}>{userData?.email || '...'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orderCount}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Health Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{appointmentCount}</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Account Overview</Text>
          {menuItems.map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.4 (Build 42)</Text>
        </View>

      </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  profileImageContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E6FFFA',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1A535C',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A535C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,

    borderRadius: 20,
    paddingVertical: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A535C',
  },
  statLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#EDF2F7',
    alignSelf: 'center',
  },
  menuContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A0AEC0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '600',
  },
});

export default Profile;