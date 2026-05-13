import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import insuranceService, { InsuranceDetail } from '../Services/insuranceService';
import Snackbar from '../Components/Snackbar';

const { width } = Dimensions.get('window');

const InsuranceDetails = ({ navigation }: { navigation: any }) => {
  const [policies, setPolicies] = useState<InsuranceDetail[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploaded, setIsUploaded] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setSnackbar({ visible: true, message, type });
  };

  // Form state
  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    holderName: '',
    expiryDate: '',
    coverage: '',
  });

  useEffect(() => {
    loadInsuranceData();
  }, []);

  const loadInsuranceData = async () => {
    setLoading(true);
    try {
      const data = await insuranceService.getInsuranceDetails();
      setPolicies(data);
      
      if (data.length > 0) {
        updateFormFromPolicy(data[0]);
      } else {
        resetForm();
      }

      const uploaded = await AsyncStorage.getItem('insurance_card_uploaded');
      if (uploaded) setIsUploaded(JSON.parse(uploaded));
    } catch (e) {
      console.error('Failed to load insurance data', e);
      showMessage('Could not fetch policies from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateFormFromPolicy = (policy: InsuranceDetail) => {
    setFormData({
      provider: policy.providerName,
      policyNumber: policy.policyNumber,
      holderName: policy.policyHolderName,
      expiryDate: policy.expiryDate,
      coverage: policy.coverageAmount,
    });
  };

  const resetForm = () => {
    setFormData({
      provider: '',
      policyNumber: '',
      holderName: '',
      expiryDate: '',
      coverage: '',
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setPolicies([...policies, { id: 'new', providerName: 'New Policy', policyHolderName: '', policyNumber: '', coverageAmount: '', expiryDate: '' }]);
    setSelectedIndex(policies.length);
    resetForm();
    showMessage('Enter your new policy details', 'info');
  };

  const handleSave = async () => {
    if (!formData.provider || !formData.policyNumber) {
      showMessage('Provider and Policy Number are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const currentPolicy = policies[selectedIndex];
      const payload: InsuranceDetail = {
        providerName: formData.provider,
        policyHolderName: formData.holderName,
        policyNumber: formData.policyNumber,
        coverageAmount: formData.coverage,
        expiryDate: formData.expiryDate,
        isPrimary: policies.length === 0 || currentPolicy?.isPrimary,
      };

      let result;
      if (currentPolicy && currentPolicy.id !== 'new') {
        result = await insuranceService.updateInsuranceDetail(currentPolicy.id!, payload);
      } else {
        result = await insuranceService.addInsuranceDetail(payload);
      }

      const updatedPolicies = [...policies];
      updatedPolicies[selectedIndex] = result;
      setPolicies(updatedPolicies);
      setIsEditing(false);
      showMessage('Policy saved successfully!', 'success');
    } catch (e) {
      console.error('Save failed', e);
      showMessage('Failed to save policy to server', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const currentPolicy = policies[selectedIndex];
    if (!currentPolicy || currentPolicy.id === 'new') {
      const updated = policies.filter((_, i) => i !== selectedIndex);
      setPolicies(updated);
      setSelectedIndex(0);
      if (updated.length > 0) updateFormFromPolicy(updated[0]);
      showMessage('New entry discarded', 'info');
      return;
    }

    Alert.alert(
      'Delete Policy',
      'Are you sure you want to remove this insurance card?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            setSaving(true);
            try {
              await insuranceService.deleteInsuranceDetail(currentPolicy.id!);
              const updated = policies.filter((_, i) => i !== selectedIndex);
              setPolicies(updated);
              const nextIndex = Math.max(0, selectedIndex - 1);
              setSelectedIndex(nextIndex);
              if (updated.length > 0) updateFormFromPolicy(updated[nextIndex]);
              else resetForm();
              showMessage('Policy deleted successfully', 'success');
            } catch (e) {
              showMessage('Failed to delete policy', 'error');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const InfoRow = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.infoInput}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          placeholder={`Enter ${label}`}
          placeholderTextColor="#CBD5E0"
        />
      ) : (
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1A535C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FFF7" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#1A535C" />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Insurance Wallet</Text>
            <Text style={styles.subtitle}>{policies.length} Policies Active</Text>
          </View>
          <TouchableOpacity onPress={handleAddNew} style={styles.addBtn}>
             <Icon name="plus-circle-outline" size={26} color="#4ECDC4" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ── Policy Selector ── */}
          <FlatList
            horizontal
            data={policies}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.policyList}
            renderItem={({ item, index }) => (
              <Pressable 
                onPress={() => {
                    setSelectedIndex(index);
                    updateFormFromPolicy(item);
                    setIsEditing(false);
                }}
                style={[styles.policyTab, selectedIndex === index && styles.activeTab]}
              >
                <Icon name="shield-outline" size={16} color={selectedIndex === index ? "white" : "#718096"} />
                <Text style={[styles.tabText, selectedIndex === index && styles.activeTabText]}>
                   {item.providerName || 'New'}
                </Text>
              </Pressable>
            )}
          />

          {/* ── Main Policy Card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.providerBadge}>
                <View style={styles.shieldIconBox}>
                    <Icon name="shield-check" size={20} color="#1A535C" />
                </View>
                <Text style={styles.providerName}>{formData.provider || 'Provider Name'}</Text>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {isEditing && policies.length > 0 && (
                    <TouchableOpacity onPress={handleDelete} disabled={saving}>
                        <View style={[styles.editBadge, { backgroundColor: '#FFF5F5' }]}>
                            <Icon name="trash-can-outline" size={16} color="#E53E3E" />
                        </View>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
                    disabled={saving}
                >
                    <View style={[styles.editBadge, isEditing && styles.saveBadge]}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#1A535C" />
                    ) : (
                        <>
                        <Icon name={isEditing ? "check-circle" : "pencil"} size={16} color={isEditing ? "#38A169" : "#1A535C"} />
                        <Text style={[styles.editText, isEditing && { color: '#38A169' }]}>
                            {isEditing ? "Confirm" : "Edit"}
                        </Text>
                        </>
                    )}
                    </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardBody}>
              <InfoRow label="Policy Holder" value={formData.holderName} field="holderName" />
              <View style={styles.rowGrid}>
                <View style={{ flex: 1 }}>
                    <InfoRow label="Policy Number" value={formData.policyNumber} field="policyNumber" />
                </View>
                <View style={{ flex: 1 }}>
                    <InfoRow label="Expiry Date" value={formData.expiryDate} field="expiryDate" />
                </View>
              </View>
              <InfoRow label="Total Sum Insured" value={formData.coverage} field="coverage" />
            </View>

            <View style={styles.cardFooter}>
              <Icon name="information-outline" size={16} color="#718096" />
              <Text style={styles.footerNote}>This card is digitally verified by the provider.</Text>
            </View>
          </View>

          {/* ── E-Card Preview ── */}
          {formData.policyNumber ? (
            <Pressable style={styles.digitalCard} onPress={() => setShowCardModal(true)}>
              <View style={styles.digitalCardHeader}>
                <View style={styles.digitalCardChip} />
                <Icon name="wifi" size={24} color="rgba(255,255,255,0.4)" style={{ transform: [{ rotate: '90deg' }] }} />
              </View>
              <View style={styles.digitalCardBody}>
                <Text style={styles.digitalCardProvider}>{formData.provider}</Text>
                <Text style={styles.digitalCardHolder}>{formData.holderName.toUpperCase() || 'HOLDER NAME'}</Text>
                <Text style={styles.digitalCardPolicy}>{formData.policyNumber}</Text>
              </View>
              <View style={styles.digitalCardFooter}>
                 <Text style={styles.digitalCardTap}>TAP TO VIEW FULL CARD</Text>
                 <Icon name="eye-outline" size={16} color="white" />
              </View>
              <View style={styles.digitalCardDecoration1} />
              <View style={styles.digitalCardDecoration2} />
            </Pressable>
          ) : null}
        </ScrollView>

        {/* ── Digital Card Modal ── */}
        <Modal
            visible={showCardModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCardModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Pressable style={styles.modalClose} onPress={() => setShowCardModal(false)}>
                        <Icon name="close" size={24} color="white" />
                    </Pressable>
                    <View style={styles.fullCard}>
                        <View style={styles.fullCardHeader}>
                            <Text style={styles.fullCardBrand}>HEALTH PASS</Text>
                            <Icon name="shield-check" size={30} color="white" />
                        </View>
                        <View style={styles.fullCardBody}>
                            <View style={styles.fullCardRow}>
                                <Text style={styles.fullCardLabel}>INSURED PERSON</Text>
                                <Text style={styles.fullCardValue}>{formData.holderName}</Text>
                            </View>
                            <View style={styles.fullCardRow}>
                                <Text style={styles.fullCardLabel}>POLICY NUMBER</Text>
                                <Text style={styles.fullCardValue}>{formData.policyNumber}</Text>
                            </View>
                            <View style={styles.fullCardGrid}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fullCardLabel}>VALID FROM</Text>
                                    <Text style={styles.fullCardValueSmall}>01/01/2024</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fullCardLabel}>VALID UNTIL</Text>
                                    <Text style={styles.fullCardValueSmall}>{formData.expiryDate}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>

        {/* ── Global Snackbar ── */}
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
  safeArea: { flex: 1, backgroundColor: '#F7FFF7' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
    minHeight: 64,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#1A535C' },
  subtitle: { fontSize: 12, color: '#718096', fontWeight: '500' },
  addBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  policyList: { marginBottom: 20, paddingVertical: 10 },
  policyTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'white',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  activeTab: { backgroundColor: '#1A535C', borderColor: '#1A535C' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#718096', marginLeft: 8 },
  activeTabText: { color: 'white' },
  card: {
    backgroundColor: 'white',
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#F7FAFC',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: width * 0.45,
  },
  shieldIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#E6FFFA', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  providerName: { color: '#1A535C', fontSize: 13, fontWeight: '800' },
  editBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6FFFA', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  saveBadge: { backgroundColor: '#F0FFF4' },
  editText: { fontSize: 12, fontWeight: '800', color: '#1A535C', marginLeft: 6 },
  cardBody: { padding: 24 },
  rowGrid: { flexDirection: 'row', gap: 20 },
  infoRow: { marginBottom: 20 },
  infoLabel: { fontSize: 10, color: '#A0AEC0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  infoValue: { fontSize: 15, color: '#1A202C', fontWeight: '700' },
  infoInput: { fontSize: 15, color: '#1A535C', fontWeight: '700', backgroundColor: '#F7FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardFooter: { backgroundColor: '#FAFCFE', padding: 16, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F4F8' },
  footerNote: { fontSize: 11, color: '#718096', marginLeft: 8, fontWeight: '600', flex: 1 },
  digitalCard: { height: 200, backgroundColor: '#1B1E2B', borderRadius: 24, padding: 24, marginBottom: 30, overflow: 'hidden', elevation: 8 },
  digitalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  digitalCardChip: { width: 42, height: 32, backgroundColor: '#D4AF37', borderRadius: 6, opacity: 0.8 },
  digitalCardBody: { flex: 1 },
  digitalCardProvider: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  digitalCardHolder: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  digitalCardPolicy: { color: '#4ECDC4', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  digitalCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  digitalCardTap: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '800' },
  digitalCardDecoration1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(78, 205, 196, 0.05)', top: -100, right: -60 },
  digitalCardDecoration2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255, 255, 255, 0.03)', bottom: -75, left: -40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', alignItems: 'center' },
  modalClose: { position: 'absolute', top: -60, right: 0, padding: 10 },
  fullCard: { width: '100%', aspectRatio: 1.6, backgroundColor: '#2A4365', borderRadius: 20, padding: 24, justifyContent: 'space-between' },
  fullCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fullCardBrand: { color: 'white', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  fullCardBody: { marginTop: 20 },
  fullCardRow: { marginBottom: 16 },
  fullCardGrid: { flexDirection: 'row' },
  fullCardLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  fullCardValue: { color: 'white', fontSize: 16, fontWeight: '700' },
  fullCardValueSmall: { color: 'white', fontSize: 14, fontWeight: '700' },
});

export default InsuranceDetails;
