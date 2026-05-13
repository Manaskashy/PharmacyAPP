import api from './api';

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
}

const authService = {
  /**
   * Login a user
   * @route POST /api/auth/login
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  register: async (data: Omit<RegisterData, 'role'>): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', {
      username: data.username,
      email: data.email,
      password: data.password
    });
    return response.data;
  },

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  getMe: async (): Promise<any> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default authService;
