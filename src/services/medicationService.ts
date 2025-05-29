import { api } from "@/config/api";
import { Medication, PaginatedResponse } from "@/types";

const medicationService = {
  /**
   * Get a paginated list of medications
   */
  getMedications: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Medication>> => {
    const response = await api.get<PaginatedResponse<Medication>>(
      "/api/medications",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get a medication by ID
   */
  getMedicationById: async (id: number): Promise<Medication> => {
    const response = await api.get<Medication>(`/api/medications/${id}`);
    return response.data;
  },

  /**
   * Search medications by name
   */
  searchMedications: async (name: string): Promise<Medication[]> => {
    const response = await api.get<Medication[]>("/api/medications/search", {
      params: { name },
    });
    return response.data;
  },

  /**
   * Create a new medication
   */
  createMedication: async (
    medication: Omit<Medication, "id">
  ): Promise<Medication> => {
    const response = await api.post<Medication>("/api/medications", medication);
    return response.data;
  },

  /**
   * Update a medication
   */
  updateMedication: async (
    id: number,
    medication: Partial<Medication>
  ): Promise<Medication> => {
    const response = await api.put<Medication>(
      `/api/medications/${id}`,
      medication
    );
    return response.data;
  },

  /**
   * Delete a medication
   */
  deleteMedication: async (id: number): Promise<void> => {
    await api.delete(`/api/medications/${id}`);
  },
};

export default medicationService;
