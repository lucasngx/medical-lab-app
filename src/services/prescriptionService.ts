import api from "./api";
import { Prescription, PaginatedResponse, Medication, PrescriptionItem } from "@/types";

const prescriptionService = {
  /**
   * Get a paginated list of prescriptions
   */
  getPrescriptions: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Prescription>> => {
    return api.get<PaginatedResponse<Prescription>>("/prescriptions", {
      page,
      limit,
    });
  },

  /**
   * Get a prescription by ID
   */
  getPrescriptionById: async (
    prescriptionId: number
  ): Promise<Prescription> => {
    return api.get<Prescription>(`/prescriptions/${prescriptionId}`);
  },

  /**
   * Create a new prescription
   */
  createPrescription: async (
    prescriptionData: Omit<Prescription, "id" | "createdAt">
  ): Promise<Prescription> => {
    return api.post<Prescription>("/prescriptions", prescriptionData);
  },

  /**
   * Update an existing prescription
   */
  updatePrescription: async (
    prescriptionId: number,
    prescriptionData: Partial<Prescription>
  ): Promise<Prescription> => {
    return api.put<Prescription>(
      `/prescriptions/${prescriptionId}`,
      prescriptionData
    );
  },

  /**
   * Delete a prescription
   */
  deletePrescription: async (prescriptionId: number): Promise<void> => {
    return api.delete(`/prescriptions/${prescriptionId}`);
  },

  /**
   * Get prescription items for a prescription
   */
  getPrescriptionItems: async (
    prescriptionId: number
  ): Promise<PrescriptionItem[]> => {
    return api.get<PrescriptionItem[]>(
      `/prescription-items/${prescriptionId}`
    );
  },

  /**
   * Add an item to a prescription
   */

  createPrescriptionItem: async(data: {
  prescriptionId: number;
  medicationId: number;
  dosage: string;
  duration: string;
  frequency: string;
}): Promise<PrescriptionItem> =>{
  return api.post<PrescriptionItem>("/prescription-items", data);
},

  /**
   * Update a prescription item
   */
  updatePrescriptionItem: async (
    prescriptionId: number,
    itemId: number,
    itemData: Partial<PrescriptionItem>
  ): Promise<PrescriptionItem> => {
    return api.put<PrescriptionItem>(
      `/prescriptions/${prescriptionId}/items/${itemId}`,
      itemData
    );
  },

  /**
   * Remove an item from a prescription
   */
  removePrescriptionItem: async (
    prescriptionId: number,
    itemId: number
  ): Promise<void> => {
    return api.delete(`/prescriptions/${prescriptionId}/items/${itemId}`);
  },

  /**
   * Get a list of medications
   */
  getMedications: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Medication>> => {
    return api.get<PaginatedResponse<Medication>>("/medications", {
      page,
      limit,
    });
  },

  /**
   * Search medications by name
   */
  searchMedications: async (
    query: string,
    limit: number = 10
  ): Promise<Medication[]> => {
    return api.get<Medication[]>("/medications/search", { query, limit });
  },

  /**
   * Get prescriptions for a patient
   */
  getPatientPrescriptions: async (
    patientId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Prescription>> => {
    return api.get<PaginatedResponse<Prescription>>("/prescriptions", {
      patientId,
      page,
      limit,
    });
  },

  /**
   * Get prescriptions for an examination
   */
  getPrescriptionsByExamination: async (examinationId: number): Promise<Prescription[]> => {
    return api.get<Prescription[]>(`/examinations/${examinationId}/prescriptions`);
  },

  /**
   * Print/export a prescription
   */
  exportPrescription: async (
    prescriptionId: number,
    format: "pdf" | "csv" = "pdf"
  ): Promise<Blob> => {
    return api.get<Blob>(`/prescriptions/${prescriptionId}/export`, {
      format,
      responseType: "blob",
    });
  },
};

export default prescriptionService;
