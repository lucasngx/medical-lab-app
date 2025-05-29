import { api } from "@/config/api";
import { Prescription, PaginatedResponse, PrescriptionItem } from "@/types";

const prescriptionService = {
  /**
   * Get a paginated list of prescriptions
   */
  getPrescriptions: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Prescription>> => {
    const response = await api.get<PaginatedResponse<Prescription>>(
      "/api/prescriptions",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get a prescription by ID
   */
  getPrescriptionById: async (id: number): Promise<Prescription> => {
    const response = await api.get<Prescription>(`/api/prescriptions/${id}`);
    return response.data;
  },

  /**
   * Get prescriptions for a specific examination
   */
  getPrescriptionsByExamination: async (
    examinationId: number
  ): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(
      `/api/prescriptions/examination/${examinationId}`
    );
    return response.data;
  },

  /**
   * Get prescriptions for a patient
   */
  getPrescriptionsByPatient: async (
    patientId: number
  ): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(
      `/api/prescriptions/patient/${patientId}`
    );
    return response.data;
  },

  /**
   * Get prescriptions by doctor
   */
  getPrescriptionsByDoctor: async (
    doctorId: number
  ): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(
      `/api/prescriptions/doctor/${doctorId}`
    );
    return response.data;
  },

  /**
   * Create a new prescription
   */
  createPrescription: async (
    prescription: Omit<Prescription, "id">
  ): Promise<Prescription> => {
    const response = await api.post<Prescription>(
      "/api/prescriptions",
      prescription
    );
    return response.data;
  },

  /**
   * Create a prescription with items
   */
  createPrescriptionWithItems: async (data: {
    prescription: Omit<Prescription, "id">;
    items: Omit<PrescriptionItem, "id" | "prescriptionId">[];
  }): Promise<Prescription> => {
    const response = await api.post<Prescription>(
      "/api/prescriptions/with-items",
      data
    );
    return response.data;
  },

  /**
   * Update a prescription
   */
  updatePrescription: async (
    id: number,
    prescription: Partial<Prescription>
  ): Promise<Prescription> => {
    const response = await api.put<Prescription>(
      `/api/prescriptions/${id}`,
      prescription
    );
    return response.data;
  },

  /**
   * Delete a prescription
   */
  deletePrescription: async (id: number): Promise<void> => {
    await api.delete(`/api/prescriptions/${id}`);
  },

  /**
   * Get prescription items with pagination
   */
  getPrescriptionItems: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<PrescriptionItem>> => {
    const response = await api.get<PaginatedResponse<PrescriptionItem>>(
      "/api/prescription-items",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get a prescription item by ID
   */
  getPrescriptionItemById: async (id: number): Promise<PrescriptionItem> => {
    const response = await api.get<PrescriptionItem>(
      `/api/prescription-items/${id}`
    );
    return response.data;
  },

  /**
   * Get prescription items for a prescription
   */
  getPrescriptionItemsByPrescription: async (
    prescriptionId: number
  ): Promise<PrescriptionItem[]> => {
    const response = await api.get<PrescriptionItem[]>(
      `/api/prescription-items/prescription/${prescriptionId}`
    );
    return response.data;
  },

  /**
   * Create a new prescription item
   */
  createPrescriptionItem: async (
    item: Omit<PrescriptionItem, "id">
  ): Promise<PrescriptionItem> => {
    const response = await api.post<PrescriptionItem>(
      "/api/prescription-items",
      item
    );
    return response.data;
  },

  /**
   * Update a prescription item
   */
  updatePrescriptionItem: async (
    id: number,
    item: Partial<PrescriptionItem>
  ): Promise<PrescriptionItem> => {
    const response = await api.put<PrescriptionItem>(
      `/api/prescription-items/${id}`,
      item
    );
    return response.data;
  },

  /**
   * Delete a prescription item
   */
  deletePrescriptionItem: async (id: number): Promise<void> => {
    await api.delete(`/api/prescription-items/${id}`);
  },
};

export default prescriptionService;
