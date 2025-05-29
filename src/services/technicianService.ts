import { api } from "@/config/api";
import { Technician, PaginatedResponse } from "@/types";

const technicianService = {
  /**
   * Get a paginated list of technicians
   */
  getTechnicians: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Technician>> => {
    const response = await api.get<PaginatedResponse<Technician>>(
      "/api/technicians",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get a technician by ID
   */
  getTechnicianById: async (id: number): Promise<Technician> => {
    const response = await api.get<Technician>(`/api/technicians/${id}`);
    return response.data;
  },

  /**
   * Search technicians by name and department
   */
  searchTechnicians: async (params: {
    name?: string;
    department?: string;
  }): Promise<PaginatedResponse<Technician>> => {
    const response = await api.get<PaginatedResponse<Technician>>(
      "/api/technicians/search",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Create a new technician
   */
  createTechnician: async (
    technician: Omit<Technician, "id">
  ): Promise<Technician> => {
    const response = await api.post<Technician>("/api/technicians", technician);
    return response.data;
  },

  /**
   * Update a technician
   */
  updateTechnician: async (
    id: number,
    technician: Partial<Technician>
  ): Promise<Technician> => {
    const response = await api.put<Technician>(
      `/api/technicians/${id}`,
      technician
    );
    return response.data;
  },

  /**
   * Delete a technician
   */
  deleteTechnician: async (id: number): Promise<void> => {
    await api.delete(`/api/technicians/${id}`);
  },
};

export default technicianService;
