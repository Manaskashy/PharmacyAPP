import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pick, types } from '@react-native-documents/picker';
import vaultService, { HealthRecord } from '../Services/vaultService';
import { API_URL } from '../Services/api';
import { ActivityIndicator } from 'react-native';

const HealthVault = ({ navigation }: { navigation: any }) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await vaultService.getMyRecords();
      setRecords(data);
    } catch (e) {
      console.error('Failed to load records:', e);
    } finally {
      setLoading(false);
    }
  };

  const [activeFilter, setActiveFilter] = useState('All Records');
  const [modalVisible, setModalVisible] = useState(false);
  const [newRecord, setNewRecord] = useState({
    title: '',
    type: 'Prescription',
    doctor: '',
    fileName: '',
    fileUri: '',
    fileType: '',
  });

  const filters = ['All Records', 'Prescriptions', 'Lab Reports', 'Invoices'];

  const filteredRecords = records.filter(record => {
    if (activeFilter === 'All Records') return true;
    if (activeFilter === 'Prescriptions') return record.type === 'Prescription';
    if (activeFilter === 'Lab Reports') return record.type === 'Lab Report';
    if (activeFilter === 'Invoices') return record.type === 'Invoice';
    return true;
  });

  const handlePickDocument = async () => {
    try {
      const res = await pick({
        type: [types.allFiles],
      });
      setNewRecord({
        ...newRecord,
        fileName: res[0].name || 'Selected File',
        title: res[0].name?.split('.')[0] || '',
        fileUri: res[0].uri || '',
        fileType: res[0].type || 'application/pdf',
      });
      setModalVisible(true);
    } catch (err: any) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED' || err?.message?.includes('cancel')) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Unknown error picking document');
        console.error(err);
      }
    }
  };

  const handleSaveRecord = async () => {
    if (!newRecord.title || !newRecord.doctor) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!newRecord.fileUri) {
      Alert.alert('Error', 'No file selected');
      return;
    }

    try {
      setUploading(true);
      await vaultService.uploadRecord(
        newRecord.fileUri,
        newRecord.fileName,
        newRecord.fileType,
        newRecord.title,
        newRecord.type,
        newRecord.doctor
      );
      
      setModalVisible(false);
      setNewRecord({ title: '', type: 'Prescription', doctor: '', fileName: '', fileUri: '', fileType: '' });
      Alert.alert('Success', 'Record uploaded successfully');
      fetchRecords(); // Refresh the list
    } catch (err) {
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (title: string, fileUrl: string) => {
    if (!fileUrl) {
      Alert.alert('Error', 'File URL is missing.');
      return;
    }

    // Construct the full URL if the backend returns a relative path
    const fullUrl = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${API_URL.replace('/api', '')}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

    try {
      // Bypassing canOpenURL check to avoid Android 11+ intent visibility issues
      await Linking.openURL(fullUrl);
    } catch (error) {
      Alert.alert('Error', `Cannot open this file URL: ${fullUrl}`);
      console.error('Download error:', error);
    }
  };

  const getRecordIcon = (type: string) => {
    if (type === 'Prescription') return 'pill';
    if (type === 'Lab Report') return 'file-document-outline';
    if (type === 'Invoice') return 'receipt';
    return 'file';
  };

  const getRecordColor = (type: string) => {
    if (type === 'Prescription') return '#FF6B6B';
    if (type === 'Lab Report') return '#4ECDC4';
    if (type === 'Invoice') return '#45B7D1';
    return '#A0AEC0';
  };

  const renderRecordItem = ({ item }: { item: HealthRecord }) => {
    const icon = getRecordIcon(item.type);
    const color = getRecordColor(item.type);
    
    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon name={icon} size={28} color={color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.recordTitle}>{item.title}</Text>
          <Text style={styles.recordSub}>{item.type} • {item.source}</Text>
          <Text style={styles.recordDate}>{new Date(item.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </View>
        <Pressable 
          style={styles.downloadButton}
          onPress={() => handleDownload(item.title, item.fileUrl)}
        >
          <Icon name="download" size={22} color="#1A535C" />
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
            <Text style={styles.title}>Health Vault</Text>
            <Text style={styles.subtitle}>Securely manage your medical records</Text>
          </View>
        </View>

        <View style={styles.filterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            {filters.map((filter, index) => (
              <Pressable 
                key={index} 
                onPress={() => setActiveFilter(filter)}
                style={[styles.filterItem, activeFilter === filter && styles.filterItemActive]}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.securityBanner}>
          <Icon name="shield-lock-outline" size={20} color="#2F855A" />
          <Text style={styles.securityText}>End-to-end encrypted storage active.</Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1A535C" />
            <Text style={{ marginTop: 12, color: '#718096', fontWeight: '500' }}>Loading records...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecords}
            renderItem={renderRecordItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="folder-open-outline" size={64} color="#E2E8F0" />
                <Text style={styles.emptyText}>No records found</Text>
              </View>
            }
          />
        )}

        <Pressable style={styles.fab} onPress={handlePickDocument}>
          <Icon name="plus" size={30} color="white" />
        </Pressable>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Upload Details</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#1A535C" />
                </Pressable>
              </View>

              <View style={styles.filePreview}>
                <Icon name="file-check-outline" size={32} color="#4ECDC4" />
                <Text style={styles.fileName} numberOfLines={1}>{newRecord.fileName}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Record Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter title (e.g., Blood Test)"
                  value={newRecord.title}
                  onChangeText={(text) => setNewRecord({...newRecord, title: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Provider / Doctor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter doctor or lab name"
                  value={newRecord.doctor}
                  onChangeText={(text) => setNewRecord({...newRecord, doctor: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Record Type</Text>
                <View style={styles.typeSelector}>
                  {['Prescription', 'Lab Report', 'Invoice'].map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.typeOption,
                        newRecord.type === type && styles.typeOptionActive
                      ]}
                      onPress={() => setNewRecord({...newRecord, type: type as any})}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        newRecord.type === type && styles.typeOptionTextActive
                      ]}>{type}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable style={styles.saveButton} onPress={handleSaveRecord} disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Complete Upload</Text>
                )}
              </Pressable>
            </KeyboardAvoidingView>
          </View>
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
    paddingHorizontal: 48,
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
  filterWrapper: {
    height: 44,
    marginBottom: 20,
  },
  filterScroll: {
    flex: 1,
  },
  filterContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'white',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterItemActive: {
    backgroundColor: '#1A535C',
    borderColor: '#1A535C',
  },
  filterText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#2F855A',
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 2,
  },
  recordSub: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A535C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 450,
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
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FFF7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
  },
  fileName: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
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
    padding: 12,
    fontSize: 15,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeOptionActive: {
    backgroundColor: '#1A535C15',
    borderColor: '#1A535C',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  typeOptionTextActive: {
    color: '#1A535C',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#1A535C',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default HealthVault;
