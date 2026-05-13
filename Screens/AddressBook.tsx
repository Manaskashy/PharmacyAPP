import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import addressService, { Address } from '../Services/addressService';
import { ActivityIndicator } from 'react-native';


const AddressBook = ({ navigation }: { navigation: any }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [fullAddress, setFullAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load addresses on mount
  React.useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (e) {
      console.error('Failed to load addresses', e);
      Alert.alert('Error', 'Failed to fetch addresses from server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await addressService.deleteAddress(id);
              loadAddresses(); // Refresh list from server
            } catch (err) {
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const renderAddressCard = ({ item }: { item: Address }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Icon 
            name={item.type === 'Home' ? 'home-outline' : 'briefcase-outline'} 
            size={16} 
            color="#1A535C" 
          />
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DEFAULT</Text>
          </View>
        )}
      </View>

      <Text style={styles.nameText}>{item.name}</Text>
      <Text style={styles.addressText}>{item.address}</Text>
      <Text style={styles.phoneText}>Phone: {item.phone}</Text>

      <View style={styles.cardFooter}>
        <Pressable style={styles.actionBtn}>
          <Icon name="pencil-outline" size={18} color="#718096" />
          <Text style={styles.actionBtnText}>Edit</Text>
        </Pressable>
        <View style={styles.btnDivider} />
        <Pressable style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
          <Icon name="trash-can-outline" size={18} color="#FF6B6B" />
          <Text style={[styles.actionBtnText, { color: '#FF6B6B' }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  const handleAddAddress = () => {
    setName('');
    setAddressType('Home');
    setFullAddress('');
    setPhone('');
    setIsDefault(addresses.length === 0);
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!name || !fullAddress || !phone) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await addressService.addAddress({
        name,
        type: addressType,
        address: fullAddress,
        phone,
        isDefault
      });
      setModalVisible(false);
      loadAddresses(); // Refresh from server
    } catch (err) {
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
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
            <Text style={styles.title}>Address Book</Text>
            <Text style={styles.subtitle}>Manage your delivery locations</Text>
          </View>
        </View>

        {loading && addresses.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1A535C" />
            <Text style={styles.loadingText}>Fetching addresses...</Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddressCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="map-marker-off-outline" size={64} color="#E2E8F0" />
                <Text style={styles.emptyTitle}>No addresses saved</Text>
                <Text style={styles.emptySubtitle}>Add a delivery address to get started</Text>
              </View>
            }
          />
        )}

        <View style={styles.footer}>
          <Pressable style={styles.addBtn} onPress={handleAddAddress}>
            <Icon name="plus" size={22} color="white" />
            <Text style={styles.addBtnText}>Add New Address</Text>
          </Pressable>
        </View>

        {/* Add Address Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Address</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#718096" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Receiver's Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address Type</Text>
                  <View style={styles.typeRow}>
                    {['Home', 'Work', 'Other'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.typeOption,
                          addressType === t && styles.typeOptionSelected
                        ]}
                        onPress={() => setAddressType(t)}
                      >
                        <Text style={[
                          styles.typeOptionText,
                          addressType === t && styles.typeOptionTextSelected
                        ]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Address</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="House No, Street, Landmark, City..."
                    multiline
                    numberOfLines={3}
                    value={fullAddress}
                    onChangeText={setFullAddress}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 9876543210"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <View style={[styles.inputGroup, styles.switchRow]}>
                  <View>
                    <Text style={styles.inputLabel}>Set as Default</Text>
                    <Text style={styles.switchSubText}>Use this for all future orders</Text>
                  </View>
                  <Switch
                    value={isDefault}
                    onValueChange={setIsDefault}
                    trackColor={{ false: '#767577', true: '#1A535C' }}
                    thumbColor={isDefault ? '#4ECDC4' : '#f4f3f4'}
                  />
                </View>

                <Pressable 
                  style={[styles.saveBtn, submitting && styles.disabledBtn]} 
                  onPress={handleSaveAddress}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Address</Text>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A535C',
    marginLeft: 6,
  },
  defaultBadge: {
    backgroundColor: '#E6FFFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38A169',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 8,
  },
  phoneText: {
    fontSize: 14,
    color: '#1A535C',
    fontWeight: '600',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#718096',
    marginLeft: 8,
  },
  btnDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#F7FAFC',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F7FFF7',
  },
  addBtn: {
    backgroundColor: '#1A535C',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  addBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A535C',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  typeOptionSelected: {
    borderColor: '#1A535C',
    backgroundColor: '#F0F9FA',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  typeOptionTextSelected: {
    color: '#1A535C',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  switchSubText: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: '#1A535C',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledBtn: {
    backgroundColor: '#CBD5E0',
  },
  saveBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AddressBook;
