import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  provider: string; 
  last4?: string;
  expiry?: string;
  upiId?: string;
  color: string;
}

const PaymentMethods = ({ navigation }: { navigation: any }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<'card' | 'upi' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [provider, setProvider] = useState('Visa');
  const [upiId, setUpiId] = useState('');

  // Load methods on mount
  React.useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const saved = await AsyncStorage.getItem('payment_methods');
      if (saved) {
        setMethods(JSON.parse(saved));
      } else {
        const defaults: PaymentMethod[] = [
          {
            id: '1',
            type: 'card',
            provider: 'Visa',
            last4: '4242',
            expiry: '12/28',
            color: '#4158D0',
          },
          {
            id: '3',
            type: 'upi',
            provider: 'Google Pay',
            upiId: 'manas.k@okaxis',
            color: '#34A853',
          },
        ];
        setMethods(defaults);
        await AsyncStorage.setItem('payment_methods', JSON.stringify(defaults));
      }
    } catch (e) {
      console.error('Failed to load methods', e);
    } finally {
      setLoading(false);
    }
  };

  const saveMethods = async (newMethods: PaymentMethod[]) => {
    try {
      await AsyncStorage.setItem('payment_methods', JSON.stringify(newMethods));
    } catch (e) {
      console.error('Failed to save methods', e);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Method', 'Removing payment method...', [
      { text: 'Cancel' }, 
      { 
        text: 'Remove', 
        onPress: () => {
          const updated = methods.filter(m => m.id !== id);
          setMethods(updated);
          saveMethods(updated);
        }
      }
    ]);
  };

  const handleSaveForm = async () => {
    if (formType === 'card' && (!cardNumber || !expiry)) {
        Alert.alert('Error', 'Please fill all card details');
        return;
    }
    if (formType === 'upi' && !upiId) {
        Alert.alert('Error', 'Please enter your UPI ID');
        return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Premium feel delay

    const newMethod: PaymentMethod = {
      id: Math.random().toString(36).substr(2, 9),
      type: formType as 'card' | 'upi',
      provider: provider,
      last4: formType === 'card' ? cardNumber.slice(-4) : undefined,
      expiry: formType === 'card' ? expiry : undefined,
      upiId: formType === 'upi' ? upiId : undefined,
      color: formType === 'card' ? (provider === 'Visa' ? '#4158D0' : '#FF6B6B') : '#34A853',
    };

    const updated = [...methods, newMethod];
    setMethods(updated);
    await saveMethods(updated);
    
    setIsSaving(false);
    setShowFormModal(false);
    resetForm();
  };

  const resetForm = () => {
    setCardNumber('');
    setExpiry('');
    setUpiId('');
    setProvider(formType === 'upi' ? 'Google Pay' : 'Visa');
  };

  const renderCard = (item: PaymentMethod) => (
    <View style={[styles.cardSurface, { backgroundColor: item.color }]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLogoBox}>
          <Icon name="credit-card-chip-outline" size={32} color="white" />
          <Text style={styles.cardBrandName}>{item.provider.toUpperCase()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.moreButton} 
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Icon name="dots-vertical" size={26} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardMiddle}>
        <Text style={styles.cardNumber}>••••  ••••  ••••  {item.last4}</Text>
      </View>
      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.cardLabel}>CARD HOLDER</Text>
          <Text style={styles.cardValue}>MANAS KASHYAP</Text>
        </View>
        <View>
          <Text style={styles.cardLabel}>EXPIRES</Text>
          <Text style={styles.cardValue}>{item.expiry}</Text>
        </View>
      </View>
      <View style={styles.cardDecoration} pointerEvents="none" />
    </View>
  );

  const renderUPI = (item: PaymentMethod) => (
    <View style={styles.upiItem}>
      <View style={[styles.upiIcon, { backgroundColor: `${item.color}15` }]}>
        <Icon name="lightning-bolt" size={20} color={item.color} />
      </View>
      <View style={styles.upiInfo}>
        <Text style={styles.upiProvider}>{item.provider}</Text>
        <Text style={styles.upiId}>{item.upiId}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleDelete(item.id)}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        activeOpacity={0.7}
      >
        <Icon name="dots-vertical" size={22} color="#CBD5E0" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#1A535C" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Payment Methods</Text>
            <Text style={styles.subtitle}>Secured and encrypted</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Saved Cards</Text>
          {methods.filter(m => m.type === 'card' || !m.type).length > 0 ? (
            methods.filter(m => m.type === 'card' || !m.type).map(m => (
                <View key={m.id}>{renderCard(m)}</View>
            ))
          ) : (
            <Text style={styles.emptyText}>No cards saved</Text>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 30 }]}>UPI IDs</Text>
          <View style={styles.upiContainer}>
            {methods.filter(m => m.type === 'upi').length > 0 ? (
                methods.filter(m => m.type === 'upi').map(m => (
                    <View key={m.id}>
                        {renderUPI(m)}
                        <View style={styles.divider} />
                    </View>
                ))
            ) : (
                <Text style={[styles.emptyText, { padding: 20 }]}>No UPI IDs saved</Text>
            )}
          </View>

          <Pressable style={styles.addMethodBtn} onPress={() => setShowTypeModal(true)}>
            <Icon name="plus-circle-outline" size={20} color="#1A535C" />
            <Text style={styles.addMethodText}>Add New Payment Method</Text>
          </Pressable>
        </ScrollView>

        {/* ── Selection Modal ── */}
        <Modal
            visible={showTypeModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTypeModal(false)}
        >
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBlur} onPress={() => setShowTypeModal(false)} />
                <View style={styles.selectionSheet}>
                    <View style={styles.sheetHeader}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Add Payment Method</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.selectionOption}
                        onPress={() => {
                            setFormType('card');
                            setProvider('Visa');
                            setShowTypeModal(false);
                            setShowFormModal(true);
                        }}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: '#EBF8FF' }]}>
                            <Icon name="credit-card-outline" size={24} color="#2B6CB0" />
                        </View>
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>Credit or Debit Card</Text>
                            <Text style={styles.optionSub}>Visa, Mastercard, etc.</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#CBD5E0" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.selectionOption}
                        onPress={() => {
                            setFormType('upi');
                            setProvider('Google Pay');
                            setShowTypeModal(false);
                            setShowFormModal(true);
                        }}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: '#F0FFF4' }]}>
                            <Icon name="lightning-bolt" size={24} color="#38A169" />
                        </View>
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>UPI ID</Text>
                            <Text style={styles.optionSub}>GPay, PhonePe, BHIM ID</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#CBD5E0" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        {/* ── Form Modal ── */}
        <Modal
            visible={showFormModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowFormModal(false)}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <Pressable style={styles.modalBlur} onPress={() => !isSaving && setShowFormModal(false)} />
                <View style={styles.formSheet}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>
                            {formType === 'card' ? 'Card Details' : 'UPI Details'}
                        </Text>
                    </View>

                    {formType === 'card' ? (
                        <View style={styles.formContent}>
                            <Text style={styles.inputLabel}>Provider</Text>
                            <View style={styles.providerRow}>
                                <TouchableOpacity 
                                    style={[styles.providerBtn, provider === 'Visa' && styles.providerBtnActive]}
                                    onPress={() => setProvider('Visa')}
                                >
                                    <Icon name="credit-card-outline" size={36} color={provider === 'Visa' ? '#1A535C' : '#A0AEC0'} />
                                    <Text style={[styles.providerText, provider === 'Visa' && styles.providerTextActive]}>Visa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.providerBtn, provider === 'Mastercard' && styles.providerBtnActive]}
                                    onPress={() => setProvider('Mastercard')}
                                >
                                    <Icon name="credit-card-chip-outline" size={36} color={provider === 'Mastercard' ? '#1A535C' : '#A0AEC0'} />
                                    <Text style={[styles.providerText, provider === 'Mastercard' && styles.providerTextActive]}>Mastercard</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>Card Number</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="0000 0000 0000 0000"
                                keyboardType="numeric"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                maxLength={16}
                            />

                            <View style={styles.rowGrid}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>Expiry</Text>
                                    <TextInput 
                                        style={styles.input}
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChangeText={setExpiry}
                                        maxLength={5}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.inputLabel}>CVV</Text>
                                    <TextInput 
                                        style={styles.input}
                                        placeholder="•••"
                                        keyboardType="numeric"
                                        secureTextEntry
                                        maxLength={3}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.formContent}>
                            <Text style={styles.inputLabel}>Select App</Text>
                            <View style={styles.upiGrid}>
                                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(p => (
                                    <TouchableOpacity 
                                        key={p}
                                        style={[styles.upiProviderBtn, provider === p && styles.upiProviderBtnActive]}
                                        onPress={() => setProvider(p)}
                                    >
                                        <Text style={[styles.upiProviderText, provider === p && styles.upiProviderTextActive]}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.inputLabel}>UPI ID</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="username@upi"
                                value={upiId}
                                onChangeText={setUpiId}
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    <TouchableOpacity 
                        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} 
                        onPress={handleSaveForm}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Method</Text>
                        )}
                    </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  cardSurface: {
    minHeight: 180,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  cardLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardBrandName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  moreButton: {
    padding: 4,
  },
  cardMiddle: {
    marginBottom: 28,
  },
  cardNumber: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  cardDecoration: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    right: -50,
    top: -50,
  },
  upiContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  upiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  upiIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  upiInfo: {
    flex: 1,
  },
  upiProvider: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  upiId: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F7FAFC',
    marginHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontStyle: 'italic',
    padding: 10,
  },
  addMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E0',
  },
  addMethodText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A535C',
    marginLeft: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBlur: {
    flex: 1,
  },
  selectionSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A535C',
  },
  selectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  optionSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  // Form Sheet
  formSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  formContent: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A0AEC0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  providerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    gap: 10,
  },
  providerBtnActive: {
    backgroundColor: '#E6FFFA',
    borderColor: '#4ECDC4',
  },
  providerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A0AEC0',
  },
  providerTextActive: {
    color: '#1A535C',
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  upiProviderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  upiProviderBtnActive: {
    backgroundColor: '#F0FFF4',
    borderColor: '#38A169',
  },
  upiProviderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A0AEC0',
  },
  upiProviderTextActive: {
    color: '#2F855A',
  },
  saveBtn: {
    backgroundColor: '#1A535C',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  }
});

export default PaymentMethods;
