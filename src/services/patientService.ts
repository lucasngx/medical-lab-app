import api from "@/services/api";
import { Patient, PaginatedResponse } from "@/types";

/**
 * Service for patient-related API operations
 */
const patientService = {
  /**
   * Get a paginated list of patients
   */
  getPatients: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<PaginatedResponse<Patient>>(
      "/api/patients",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get a patient by ID
   */
  getPatientById: async (patientId: number): Promise<Patient> => {
    const response = await api.get<Patient>(`/api/patients/${patientId}`);
    return response.data;
  },

  /**
   * Create a new patient
   */
  createPatient: async (
    patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">
  ): Promise<Patient> => {
    const response = await api.post<Patient>("/api/patients", patientData);
    return response.data;
  },

  /**
   * Update an existing patient
   */
  updatePatient: async (
    patientId: number,
    patientData: Partial<Patient>
  ): Promise<Patient> => {
    const response = await api.put<Patient>(
      `/api/patients/${patientId}`,
      patientData
    );
    return response.data;
  },

  /**
   * Delete a patient
   */
  deletePatient: async (patientId: number): Promise<void> => {
    await api.delete(`/api/patients/${patientId}`);
  },

  /**
   * Search patients by name
   */
  searchPatients: async (name: string): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<PaginatedResponse<Patient>>(
      "/api/patients/search",
      {
        params: { name },
      }
    );
    return response.data;
  },
};

export default patientService;
