import api from './api';

export interface HomeCareService {
  id: string;
  name: string;
  title: string;
  description: string | null;
  price: number;
  priceUnit: string;
  availability: string;
  rating: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

const homecareService = {
  /**
   * Fetch all home healthcare services
   * @route GET /api/home-services
   */
  getServices: async (): Promise<HomeCareService[]> => {
    const response = await api.get('/home-services');
    return response.data;
  },

  /**
   * Get single service by ID
   * @route GET /api/home-services/:id
   */
  getServiceById: async (id: string): Promise<HomeCareService> => {
    const response = await api.get(`/home-services/${id}`);
    return response.data;
  }
};

export default homecareService;
