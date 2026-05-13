import api from './api';

export interface Equipment {
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

const surgicalEquipmentService = {
  /**
   * Fetch all surgical equipment
   * @route GET /api/products/?type=surgical
   */
  getEquipment: async (): Promise<Equipment[]> => {
    const response = await api.get('/products/?type=surgical');
    return response.data;
  },

  /**
   * Get single equipment by ID
   * @route GET /api/products/:id
   */
  getEquipmentById: async (id: string): Promise<Equipment> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

export default surgicalEquipmentService;
