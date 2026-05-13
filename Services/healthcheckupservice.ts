import api from './api';

export interface HealthPackage {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string | null;
  availability: string;
  includesTests: string[];
  reportTime: string | null;
  labName: string | null;
  address: string | null;
  price: number;
  stock: number;
  rating: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

const healthcheckupService = {
  /**
   * Fetch all health checkup packages
   * @route GET /api/products?type=package
   */
  getPackages: async (): Promise<HealthPackage[]> => {
    const response = await api.get('/products?type=package');
    return response.data;
  },

  /**
   * Get single package by ID
   * @route GET /api/products/:id
   */
  getPackageById: async (id: string): Promise<HealthPackage> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
};

export default healthcheckupService;
