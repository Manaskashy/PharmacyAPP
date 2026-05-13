import api from './api';
import authService from './authService';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthRecord {
  id: string;
  title: string;
  type: string;
  source: string;
  fileUrl: string;
  recordDate: string;
}

const vaultService = {
  // 1. Upload a file
  uploadRecord: async (
    fileUri: string,
    fileName: string,
    fileType: string,
    title: string,
    type: string,
    source: string
  ): Promise<HealthRecord> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Create FormData object
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('source', source);
      
      // Format the file object for React Native
      formData.append('file', {
        uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
        name: fileName || 'document.pdf',
        type: fileType || 'application/pdf',
      } as any);

      // We use the base axios instance 'api'
      const response = await api.post('/vault/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading record:', error);
      throw error;
    }
  },

  // 2. Get all records
  getMyRecords: async (): Promise<HealthRecord[]> => {
    try {
      const response = await api.get('/vault/my-records');
      return response.data;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  },

  // 3. Delete a record
  deleteRecord: async (id: string): Promise<void> => {
    try {
      await api.delete(`/vault/${id}`);
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }
};

export default vaultService;
