import api from './api';
import { Doctor, PaginatedResponse } from '@/types';

const doctorService = {
  /**
   * Get a paginated list of doctors
   */
  getDoctors: async (page: number = 1, limit: number = 10) => {
    return api.get<PaginatedResponse<Doctor>>('/doctors', {
      page,
      limit,
    });
  },

  /**
   * Get a doctor by ID
   */
  getDoctorById: async (id: number) => {
    return api.get<Doctor>(`/doctors/${id}`);
  },

  /**
   * Create a new doctor
   */
  createDoctor: async (doctor: Partial<Doctor>) => {
    return api.post<Doctor>('/doctors', doctor);
  },

  /**
   * Update a doctor
   */
  updateDoctor: async (id: number, doctor: Partial<Doctor>) => {
    return api.put<Doctor>(`/doctors/${id}`, doctor);
  },

  /**
   * Delete a doctor
   */
  deleteDoctor: async (id: number) => {
    return api.delete(`/doctors/${id}`);
  },
};

export default doctorService;