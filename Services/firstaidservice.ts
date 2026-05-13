import api from './api';

export interface FirstAidItem {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string | null;
  availability: string;
  price: number;
  stock: number;
  rating: number;
  image: string | null;
  manufacturer: string | null;
  createdAt: string;
  updatedAt: string;
}

const firstaidService = {
  /**
   * Fetch all first aid supplies
   * @route GET /api/products?type=first_aid
   */
  getItems: async (): Promise<FirstAidItem[]> => {
    const response = await api.get('/products?type=first_aid');
    return response.data;
  },

  /**
   * Get single item by ID
   * @route GET /api/products/:id
   */
  getItemById: async (id: string): Promise<FirstAidItem> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

export default firstaidService;
