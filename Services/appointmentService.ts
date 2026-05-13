import api from './api';

export interface UnavailableSlotsResponse {
  date: string;
  unavailableSlots: string[];
}

export interface BookAppointmentRequest {
  doctorId: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string;        // e.g. "09:00"
  type?: string;           // 'in-person' | 'video'
}

export interface BookHomeServiceRequest {
  serviceId: string;
  bookingDate: string;     // YYYY-MM-DD
  timeSlot: string;        // e.g. "10:00"
  address: string;
}

const appointmentService = {
  // 1. Get unavailable time slots for a doctor on a date
  getUnavailableSlots: async (
    doctorId: string,
    date: string
  ): Promise<UnavailableSlotsResponse> => {
    try {
      const response = await api.get(
        `/appointments/doctor/${doctorId}/slots`,
        { params: { date } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching unavailable slots:', error);
      throw error;
    }
  },

  // 2. Book a doctor appointment
  bookAppointment: async (data: BookAppointmentRequest) => {
    try {
      const response = await api.post('/appointments', data);
      return response.data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  // 3. Book a home care service
  bookHomeService: async (data: BookHomeServiceRequest) => {
    try {
      const response = await api.post('/home-services/book', data);
      return response.data;
    } catch (error) {
      console.error('Error booking home service:', error);
      throw error;
    }
  },

  // 4. Get my appointments
  getMyAppointments: async () => {
    try {
      const response = await api.get('/appointments/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // 5. Get my home care bookings
  getMyHomeBookings: async () => {
    try {
      const response = await api.get('/home-services/bookings/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching home bookings:', error);
      throw error;
    }
  },

  // 6. Cancel a doctor appointment
  cancelAppointment: async (id: string) => {
    try {
      const response = await api.put(`/appointments/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },
};

export default appointmentService;
