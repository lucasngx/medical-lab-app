import api from "@/services/api";
import { AssignedTest, TestStatus, PaginatedResponse } from "@/types";
import { AxiosError } from "axios";
import { Role } from "@/types";

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
  getAssignedTestById: async (id: number): Promise<AssignedTest> => {
    const response = await api.get<AssignedTest>(`/api/assigned-tests/${id}`);
    return response.data;
  },

  /**
   * Create new assigned test
   */
  createAssignedTest: async (
    assignedTest: Omit<AssignedTest, "id">
  ): Promise<AssignedTest> => {
    const response = await api.post<AssignedTest>(
      "/api/assigned-tests",
      assignedTest
    );
    return response.data;
  },

  /**
   * Update assigned test
   */
  updateAssignedTest: async (
    id: number,
    assignedTest: Partial<AssignedTest>
  ): Promise<AssignedTest> => {
    const response = await api.put<AssignedTest>(
      `/api/assigned-tests/${id}`,
      assignedTest
    );
    return response.data;
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
      "/api/assigned-tests/status",
      {
        params: { status },
      }
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
