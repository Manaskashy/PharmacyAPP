import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ambulanceService, { AmbulanceType } from '../Services/ambulanceservice';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

// Interface moved to service file

const Ambulance = ({ navigation }: { navigation: any }) => {
  const [ambulances, setAmbulances] = useState<AmbulanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const data = await ambulanceService.getAmbulances();
      setAmbulances(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching ambulances:', err);
      setError('Failed to load ambulance services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getAmbulanceIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('cardiac') || t.includes('als')) return 'heart-pulse';
    if (t.includes('icu')) return 'hospital-box';
    if (t.includes('air') || t.includes('helicopter')) return 'helicopter';
    return 'ambulance';
  };

  const getAmbulanceColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('cardiac') || t.includes('als')) return '#FF6B6B';
    if (t.includes('icu')) return '#45B7D1';
    if (t.includes('air') || t.includes('helicopter')) return '#F9D423';
    return '#4ECDC4';
  };

  const renderAmbulanceCard = ({ item }: { item: AmbulanceType }) => {
    const ambColor = getAmbulanceColor(item.type);
    const ambIcon = getAmbulanceIcon(item.type);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${ambColor}15` }]}>
            <Icon name={ambIcon} size={32} color={ambColor} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.type}</Text>
            <View style={styles.etaBadge}>
              <Icon name="clock-outline" size={14} color="#718096" />
              <Text style={styles.etaText}>ETA: {item.eta}</Text>
            </View>
          </View>
          <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        {!item.available && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Currently Unavailable</Text>
          </View>
        )}

        <Pressable
          style={[
            styles.callButton,
            { backgroundColor: item.available ? '#1A535C' : '#A0AEC0' }
          ]}
          disabled={!item.available}
          onPress={() => handleCall(item.phone)}
        >
          <Icon name="phone-in-talk" size={20} color="white" />
          <Text style={styles.callButtonText}>Call Now</Text>
        </Pressable>
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
            <Text style={styles.title}>Emergency Ambulance</Text>
            <View style={styles.statusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.statusText}>Location Sharing Active</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A535C" />
            <Text style={styles.loadingText}>Searching nearby ambulances...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchAmbulances}>
              <Text style={styles.retryButtonText}>Retry Search</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={ambulances}
            renderItem={renderAmbulanceCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#48BB78',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    marginRight: 14,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 4,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A535C',
  },
  description: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 18,
  },
  unavailableBadge: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  unavailableText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  callButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  mainEmergencyButton: {
    backgroundColor: '#E53E3E',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  mainEmergencyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
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

export default Ambulance;
