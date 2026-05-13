import api from './api';

export interface InsuranceDetail {
  id?: string;
  providerName: string;
  policyHolderName: string;
  policyNumber: string;
  memberId?: string;
  planType?: string;
  coverageAmount: string;
  expiryDate: string;
  isPrimary?: boolean;
}

export const insuranceService = {
  getInsuranceDetails: async (): Promise<InsuranceDetail[]> => {
    const response = await api.get('/insurance');
    return response.data;
  },

  addInsuranceDetail: async (data: InsuranceDetail): Promise<InsuranceDetail> => {
    const response = await api.post('/insurance', data);
    return response.data;
  },

  updateInsuranceDetail: async (id: string, data: Partial<InsuranceDetail>): Promise<InsuranceDetail> => {
    const response = await api.put(`/insurance/${id}`, data);
    return response.data;
  },

  deleteInsuranceDetail: async (id: string): Promise<void> => {
    await api.delete(`/insurance/${id}`);
  }
};

export default insuranceService;
