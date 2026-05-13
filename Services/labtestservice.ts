import api from './api';

export interface LabTest {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string | null;
  availability: string;
  reportTime: string | null;
  labName: string | null;
  includesTests: string | null;
  price: number;
  stock: number;
  rating: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

const labtestService = {
  /**
   * Fetch all lab tests
   * @route GET /api/products/?type=test
   */
  getLabTests: async (): Promise<LabTest[]> => {
    const response = await api.get('/products/?type=test');
    return response.data;
  },

  /**
   * Get single lab test by ID
   * @route GET /api/products/:id
   */
  getLabTestById: async (id: string): Promise<LabTest> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

export default labtestService;
