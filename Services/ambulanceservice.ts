import api from './api';

export interface AmbulanceType {
  id: string;
  type: string;
  price: number;
  eta: string;
  description: string;
  available: boolean;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

const ambulanceService = {
  /**
   * Fetch all ambulances
   * @route GET /api/support/ambulances
   */
  getAmbulances: async (): Promise<AmbulanceType[]> => {
    const response = await api.get('/support/ambulances');
    return response.data;
  },

  /**
   * Get single ambulance by ID
   * @route GET /api/support/ambulances/:id
   */
  getAmbulanceById: async (id: string): Promise<AmbulanceType> => {
    const response = await api.get(`/support/ambulances/${id}`);
    return response.data;
  }
};

export default ambulanceService;
