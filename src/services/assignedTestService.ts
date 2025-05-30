import { api } from '../config/api';
import { AssignedTest, TestStatus, PaginatedResponse } from "@/types";
import { AxiosError } from "axios";
import { Role } from "@/types";

export interface CreateAssignedTestRequest {
  testId: number;
  patientId: number;
  doctorId: number;
  examinationId: number;
  technicianId?: number;
  notes?: string;
}

const assignedTestService = {
  /**
   * Get all assigned tests with pagination
   */
  getAssignedTests: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<AssignedTest>> => {
    const response = await api.get<PaginatedResponse<AssignedTest>>(
      "/api/assigned-tests",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get assigned test by ID
   */
  getById: async (id: number): Promise<AssignedTest> => {
    try {
      const response = await api.get<AssignedTest>(`/api/assigned-tests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned test:', error);
      throw error;
    }
  },

  /**
   * Create new assigned test
   */
  create: async (data: CreateAssignedTestRequest): Promise<AssignedTest> => {
    // Validate required fields
    if (!data.testId) throw new Error('Test ID is required');
    if (!data.patientId) throw new Error('Patient ID is required');
    if (!data.doctorId) throw new Error('Doctor ID is required');
    if (!data.examinationId) throw new Error('Examination ID is required');

    try {
      // Format the request to match backend expectations
      const requestData = {
        test: { id: data.testId },
        patient: { id: data.patientId },
        doctor: { id: data.doctorId },
        examination: { id: data.examinationId },
        technician: data.technicianId ? { id: data.technicianId } : undefined,
        notes: data.notes,
        status: 'PENDING' // Default status
      };

      const response = await api.post<AssignedTest>('/api/assigned-tests', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating assigned test:', error);
      throw error;
    }
  },

  /**
   * Update assigned test
   */
  update: async (id: number, data: Partial<AssignedTest>): Promise<AssignedTest> => {
    try {
      const response = await api.put<AssignedTest>(`/api/assigned-tests/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating assigned test:', error);
      throw error;
    }
  },

  /**
   * Delete assigned test
   */
  deleteAssignedTest: async (id: number): Promise<void> => {
    await api.delete(`/api/assigned-tests/${id}`);
  },

  /**
   * Assign lab test
   */
  assignLabTest: async (data: {
    examinationId: number;
    labTestId: number;
    technicianId?: number;
  }): Promise<AssignedTest> => {
    try {
      // Ensure all required fields are present
      if (!data.examinationId || !data.labTestId) {
        throw new Error("Missing required fields: examinationId or labTestId");
      }

      // Map frontend field names to backend field names
      const backendData = {
        examination: { id: data.examinationId },
        labTest: { id: data.labTestId },
        technician: data.technicianId ? { id: data.technicianId } : undefined,
        status: "PENDING" // Add default status
      };

      const response = await api.post<AssignedTest>(
        "/api/assigned-tests",
        backendData
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error assigning lab test:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        throw new Error(`Failed to assign lab test: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  },

  /**
   * Update assigned test status
   */
  updateAssignedTestStatus: async (
    id: number,
    status: TestStatus
  ): Promise<AssignedTest> => {
    const response = await api.put<AssignedTest>(
      `/api/assigned-tests/${id}/status`,
      null,
      {
        params: { status },
      }
    );
    return response.data;
  },

  /**
   * Get assigned tests by examination ID
   */
  getAssignedTestsByExamination: async (
    examinationId: number
  ): Promise<AssignedTest[]> => {
    const response = await api.get<AssignedTest[]>(
      `/api/assigned-tests/examination/${examinationId}`
    );
    return response.data;
  },

  /**
   * Get assigned tests by status
   */
  getAssignedTestsByStatus: async (
    status: TestStatus
  ): Promise<PaginatedResponse<AssignedTest>> => {
    const response = await api.get<PaginatedResponse<AssignedTest>>(
      `/api/assigned-tests/status/${status}`
    );
    return response.data;
  },

  /**
   * Search assigned tests
   */
  searchAssignedTests: async (params: {
    searchTerm?: string;
    status?: TestStatus;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<AssignedTest>> => {
    const response = await api.get<PaginatedResponse<AssignedTest>>(
      "/api/assigned-tests/search",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get assigned tests by patient ID
   */
  getAssignedTestsByPatient: async (
    patientId: number
  ): Promise<AssignedTest[]> => {
    const response = await api.get<AssignedTest[]>(
      `/api/assigned-tests/patient/${patientId}`
    );
    return response.data;
  },

  /**
   * Get assigned tests by technician ID
   */
  getAssignedTestsByTechnician: async (
    technicianId: number
  ): Promise<AssignedTest[]> => {
    const response = await api.get<AssignedTest[]>(
      `/api/assigned-tests/technician/${technicianId}`
    );
    return response.data;
  },
};

export default assignedTestService;
