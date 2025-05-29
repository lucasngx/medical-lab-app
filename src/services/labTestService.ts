import api from "@/services/api";
import { LabTest, PaginatedResponse } from "@/types";

const labTestService = {
  /**
   * Get a paginated list of lab tests
   */
  getLabTests: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<LabTest>> => {
    const response = await api.get<PaginatedResponse<LabTest>>(
      "/api/lab-tests",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get a lab test by ID
   */
  getLabTestById: async (id: number): Promise<LabTest> => {
    const response = await api.get<LabTest>(`/api/lab-tests/${id}`);
    return response.data;
  },

  /**
   * Get lab tests by patient ID
   */
  getLabTestsByPatient: async (patientId: number): Promise<LabTest[]> => {
    const response = await api.get<LabTest[]>(
      `/api/lab-tests/patient/${patientId}`
    );
    return response.data;
  },

  /**
   * Create a new lab test
   */
  createLabTest: async (labTest: Omit<LabTest, "id">): Promise<LabTest> => {
    const response = await api.post<LabTest>("/api/lab-tests", labTest);
    return response.data;
  },

  /**
   * Update a lab test
   */
  updateLabTest: async (
    id: number,
    labTest: Partial<LabTest>
  ): Promise<LabTest> => {
    const response = await api.put<LabTest>(`/api/lab-tests/${id}`, labTest);
    return response.data;
  },

  /**
   * Delete a lab test
   */
  deleteLabTest: async (id: number): Promise<void> => {
    await api.delete(`/api/lab-tests/${id}`);
  },
};

export default labTestService;
