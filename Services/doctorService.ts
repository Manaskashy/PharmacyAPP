import api from './api';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  patientCount: string;
  experience: number;
  location: string;
  fees: number;
  image: string | null;
  biography: string | null;
  education: string[];
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

const doctorService = {
  /**
   * Fetch all doctors
   * @route GET /api/doctors
   */
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/doctors');
    return response.data;
  },

  /**
   * Get single doctor by ID
   * @route GET /api/doctors/:id
   */
  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  }
};

export default doctorService;
