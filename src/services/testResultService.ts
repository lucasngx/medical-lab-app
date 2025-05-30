import api from "@/services/api";
import { TestResult, ResultStatus, PaginatedResponse } from "@/types";
import { AxiosError } from "axios";

const testResultService = {
  /**
   * Test endpoint accessibility
   */
  testEndpoint: async () => {
    try {
      // Try to get a single test result first to test basic connectivity
      const response = await api.get<TestResult>("/api/test-results/1");
      console.log("Test endpoint response:", response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Test endpoint error:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.config?.headers
        });
      }
      throw error;
    }
  },

  /**
   * Get all test results with pagination
   */
  getTestResults: async (page: number, size: number) => {
    console.log(`[TestResults] Fetching test results - page: ${page}, size: ${size}`);
    try {
      const response = await api.get<{ data: TestResult[]; total: number }>(
        `/api/test-results`,
        {
          params: { page, size },
        }
      );
      
      // Log the full response structure for debugging
      console.log('[TestResults] API Response:', response);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      const results = response.data.data || [];
      const total = response.data.total || 0;
      
      console.log(`[TestResults] Successfully fetched ${results.length} results out of ${total} total`);
      return { data: results, total };
    } catch (error) {
      console.error('[TestResults] Error fetching test results:', error);
      if (error instanceof AxiosError) {
        console.error('[TestResults] API Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.config?.headers
        });
      }
      throw error;
    }
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
    testResult: Omit<TestResult, "id" | "createdAt" | "updatedAt">
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
    const response = await api.get<TestResult[]>(`/api/test-results/status/${status}`);
    return response.data;
  },
};

export default testResultService;
