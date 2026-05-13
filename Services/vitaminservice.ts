import api from './api';

export interface VitaminProduct {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string | null;
  availability: string;
  reportTime: string | null;
  address: string | null;
  dosage: string | null;
  manufacturer: string | null;
  price: number;
  stock: number;
  rating: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

const vitaminService = {
  /**
   * Fetch all vitamins
   * @route GET /api/products?type=vitamin
   */
  getVitamins: async (): Promise<VitaminProduct[]> => {
    const response = await api.get('/products?type=vitamin');
    return response.data;
  },

  /**
   * Get single vitamin by ID
   * @route GET /api/products/:id
   */
  getVitaminById: async (id: string): Promise<VitaminProduct> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

export default vitaminService;
