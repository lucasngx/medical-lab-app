import api from './api';
import { Technician, PaginatedResponse } from '@/types';

const technicianService = {
  /**
   * Get a paginated list of technicians
   */
  getTechnicians: async (page: number = 1, limit: number = 10) => {
    return api.get<PaginatedResponse<Technician>>('/technicians', {
      page,
      limit,
    });
  },

  /**
   * Get a technician by ID
   */
  getTechnicianById: async (id: number) => {
    return api.get<Technician>(`/technicians/${id}`);
  },

  /**
   * Create a new technician
   */
  createTechnician: async (technician: Partial<Technician>) => {
    return api.post<Technician>('/technicians', technician);
  },

  /**
   * Update a technician
   */
  updateTechnician: async (id: number, technician: Partial<Technician>) => {
    return api.put<Technician>(`/technicians/${id}`, technician);
  },

  /**
   * Delete a technician
   */
  deleteTechnician: async (id: number) => {
    return api.delete(`/technicians/${id}`);
  },
};

export default technicianService;