import api from "@/services/api";
import { TestResult, ResultStatus, PaginatedResponse } from "@/types";

const testResultService = {
  /**
   * Get all test results with pagination
   */
  getTestResults: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<TestResult>> => {
    const response = await api.get<PaginatedResponse<TestResult>>(
      "/api/test-results",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get test result by ID
   */
  getTestResultById: async (id: number): Promise<TestResult> => {
    const response = await api.get<TestResult>(`/api/test-results/${id}`);
    return response.data;
  },

  /**
   * Create new test result
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
   * Update test result
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
   * Delete test result
   */
  deleteTestResult: async (id: number): Promise<void> => {
    await api.delete(`/api/test-results/${id}`);
  },

  /**
   * Update test result status
   */
  updateTestResultStatus: async (
    id: number,
    status: ResultStatus
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
   * Get test result by assigned test ID
   */
  getTestResultByAssignedTest: async (
    assignedTestId: number
  ): Promise<TestResult> => {
    const response = await api.get<TestResult>(
      `/api/test-results/assigned-test/${assignedTestId}`
    );
    return response.data;
  },

  /**
   * Get test results by technician ID
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
  getTestResultsByStatus: async (
    status: ResultStatus
  ): Promise<TestResult[]> => {
    const response = await api.get<TestResult[]>("/api/test-results/status", {
      params: { status },
    });
    return response.data;
  },
};

export default testResultService;
