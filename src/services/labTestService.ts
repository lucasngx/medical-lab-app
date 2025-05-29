import { api } from "@/config/api";
import {
  LabTest,
  AssignedTest,
  TestResult,
  TestStatus,
  PaginatedResponse,
} from "@/types";

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

  /**
   * Get a paginated list of assigned tests
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
   * Get an assigned test by ID
   */
  getAssignedTestById: async (id: number): Promise<AssignedTest> => {
    const response = await api.get<AssignedTest>(`/api/assigned-tests/${id}`);
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
    status: TestStatus,
    page: number = 0,
    limit: number = 10
  ): Promise<PaginatedResponse<AssignedTest>> => {
    const response = await api.get<PaginatedResponse<AssignedTest>>(
      "/api/assigned-tests/status",
      {
        params: { status, page, limit },
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
   * Create an assigned test
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
   * Assign tests to technicians
   */
  assignTests: async (data: {
    testIds: number[];
    technicianId: number;
  }): Promise<AssignedTest[]> => {
    const response = await api.post<AssignedTest[]>(
      "/api/assigned-tests/assign",
      data
    );
    return response.data;
  },

  /**
   * Update an assigned test
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
   * Delete an assigned test
   */
  deleteAssignedTest: async (id: number): Promise<void> => {
    await api.delete(`/api/assigned-tests/${id}`);
  },

  /**
   * Get test results with pagination and sorting
   */
  getTestResults: async (params: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "asc" | "desc";
  }): Promise<PaginatedResponse<TestResult>> => {
    const response = await api.get<PaginatedResponse<TestResult>>(
      "/api/test-results",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Get a test result by ID
   */
  getTestResultById: async (id: number): Promise<TestResult> => {
    const response = await api.get<TestResult>(`/api/test-results/${id}`);
    return response.data;
  },

  /**
   * Get test results by technician
   */
  getTestResultsByTechnician: async (
    technicianId: number
  ): Promise<TestResult[]> => {
    const response = await api.get<TestResult[]>(
      `/api/test-results/technician/${technicianId}`
    );
    return response.data;
  },

  /**
   * Get test results by status
   */
  getTestResultsByStatus: async (status: TestStatus): Promise<TestResult[]> => {
    const response = await api.get<TestResult[]>("/api/test-results/status", {
      params: { status },
    });
    return response.data;
  },

  /**
   * Get test results by assigned test
   */
  getTestResultsByAssignedTest: async (
    assignedTestId: number
  ): Promise<TestResult[]> => {
    const response = await api.get<TestResult[]>(
      `/api/test-results/assigned-test/${assignedTestId}`
    );
    return response.data;
  },

  /**
   * Create a test result
   */
  createTestResult: async (
    testResult: Omit<TestResult, "id">
  ): Promise<TestResult> => {
    const response = await api.post<TestResult>(
      "/api/test-results",
      testResult
    );
    return response.data;
  },

  /**
   * Update a test result
   */
  updateTestResult: async (
    id: number,
    testResult: Partial<TestResult>
  ): Promise<TestResult> => {
    const response = await api.put<TestResult>(
      `/api/test-results/${id}`,
      testResult
    );
    return response.data;
  },

  /**
   * Update test result status
   */
  updateTestResultStatus: async (
    id: number,
    status: TestStatus
  ): Promise<TestResult> => {
    const response = await api.put<TestResult>(
      `/api/test-results/${id}/status`,
      null,
      {
        params: { status },
      }
    );
    return response.data;
  },

  /**
   * Delete a test result
   */
  deleteTestResult: async (id: number): Promise<void> => {
    await api.delete(`/api/test-results/${id}`);
  },
};

export default labTestService;
