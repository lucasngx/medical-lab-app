import api from './api';
import { Medication, PaginatedResponse } from '@/types';

const medicationService = {
  /**
   * Get a paginated list of medications
   */
  getMedications: async (page: number = 1, limit: number = 10) => {
    return api.get<PaginatedResponse<Medication>>('/medications', {
      page,
      limit,
    });
  },

  /**
   * Get a medication by ID
   */
  getMedicationById: async (id: number) => {
    return api.get<Medication>(`/medications/${id}`);
  },

  /**
   * Create a new medication
   */
  createMedication: async (medication: Partial<Medication>) => {
    return api.post<Medication>('/medications', medication);
  },

  /**
   * Update a medication
   */
  updateMedication: async (id: number, medication: Partial<Medication>) => {
    return api.put<Medication>(`/medications/${id}`, medication);
  },

  /**
   * Delete a medication
   */
  deleteMedication: async (id: number) => {
    return api.delete(`/medications/${id}`);
  },
};

export default medicationService;
