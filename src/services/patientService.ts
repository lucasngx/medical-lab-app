import api from "./api";
import { Patient, PaginatedResponse } from "../types";

/**
 * Service for patient-related API operations
 */
const patientService = {
  /**
   * Get a paginated list of patients
   */
  getPatients: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Patient>> => {
    return api.get<PaginatedResponse<Patient>>("/patients");
  },

  /**
   * Get a patient by ID
   */
  getPatientById: async (patientId: number): Promise<Patient> => {
    return api.get<Patient>(`/patients/${patientId}`);
  },

  /**
   * Create a new patient
   */
  createPatient: async (
    patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">
  ): Promise<Patient> => {
    return api.post<Patient>("/patients", patientData);
  },

  /**
   * Update an existing patient
   */
  updatePatient: async (
    patientId: number,
    patientData: Partial<Patient>
  ): Promise<Patient> => {
    return api.put<Patient>(`/patients/${patientId}`, patientData);
  },

  /**
   * Delete a patient
   */
  deletePatient: async (patientId: number): Promise<void> => {
    return api.delete(`/patients/${patientId}`);
  },

  /**
   * Search patients by name, email, or phone
   */
  searchPatients: async (
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Patient>> => {
    return api.get<PaginatedResponse<Patient>>("/patients/search", {
      query,
      page,
      limit,
    });
  },

  /**
   * Get patient examination history
   */
  getPatientExaminations: async (patientId: number): Promise<any[]> => {
    return api.get<any[]>(`/patients/${patientId}/examinations`);
  },

  /**
   * Get patient prescription history
   */
  getPatientPrescriptions: async (patientId: number): Promise<any[]> => {
    return api.get<any[]>(`/patients/${patientId}/prescriptions`);
  },
};

export default patientService;
