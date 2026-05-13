import api from './api';

export interface Medicine {
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
  dosage: string | null;
  manufacturer: string | null;
  createdAt: string;
  updatedAt: string;
}

const medicineService = {
  /**
   * Fetch all medicines
   * @route GET /api/products/?type=medicine
   */
  getMedicines: async (): Promise<Medicine[]> => {
    const response = await api.get('/products/?type=medicine');
    return response.data;
  },

  /**
   * Get single medicine by ID
   * @route GET /api/products/:id
   */
  getMedicineById: async (id: string): Promise<Medicine> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

export default medicineService;
