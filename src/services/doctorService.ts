import api from "@/services/api";
import { Doctor, PaginatedResponse } from "@/types";

const doctorService = {
  /**
   * Get a paginated list of doctors
   */
  getDoctors: async (page: number = 0, size: number = 10) => {
    const response = await api.get<PaginatedResponse<Doctor>>("/api/doctors", {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get a doctor by ID
   */
  getDoctorById: async (id: number) => {
    const response = await api.get<Doctor>(`/api/doctors/${id}`);
    return response.data;
  },

  /**
   * Create a new doctor
   */
  createDoctor: async (doctor: Partial<Doctor>) => {
    const response = await api.post<Doctor>("/api/doctors", doctor);
    return response.data;
  },

  /**
   * Update a doctor
   */
  updateDoctor: async (id: number, doctor: Partial<Doctor>) => {
    const response = await api.put<Doctor>(`/api/doctors/${id}`, doctor);
    return response.data;
  },

  /**
   * Delete a doctor
   */
  deleteDoctor: async (id: number) => {
    await api.delete(`/api/doctors/${id}`);
  },

  /**
   * Search doctors by name and specialization
   */
  searchDoctors: async (params: {
    name?: string;
    specialization?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await api.get<PaginatedResponse<Doctor>>(
      "/api/doctors/search",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get doctors by specialization
   */
  getDoctorsBySpecialization: async (specialization: string) => {
    const response = await api.get<Doctor[]>(
      `/api/doctors/specialization/${specialization}`
    );
    return response.data;
  },
};

export default doctorService;
