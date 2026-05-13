import api from './api';

export interface Address {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const addressService = {
  /**
   * Get all user addresses
   */
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/addresses');
    return response.data;
  },

  /**
   * Add a new address
   */
  addAddress: async (data: Omit<Address, 'id'>): Promise<Address> => {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  /**
   * Update an address
   */
  updateAddress: async (id: string, data: Partial<Address>): Promise<Address> => {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  /**
   * Delete an address
   */
  deleteAddress: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  }
};

export default addressService;
