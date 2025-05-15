import api from "./api";
import {
  LabTest,
  AssignedTest,
  TestResult,
  TestStatus,
  PaginatedResponse,
} from "../types";

/**
 * Service for lab test-related API operations
 */
const labTestService = {
  /**
   * Get a paginated list of lab tests
   */
  getLabTests: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<LabTest>> => {
    return api.get<PaginatedResponse<LabTest>>("/lab-tests", { page, limit });
  },

  /**
   * Get a lab test by ID
   */
  getLabTestById: async (labTestId: number): Promise<LabTest> => {
    return api.get<LabTest>(`/lab-tests/${labTestId}`);
  },

  /**
   * Create a new lab test
   */
  createLabTest: async (labTestData: Omit<LabTest, "id">): Promise<LabTest> => {
    return api.post<LabTest>("/lab-tests", labTestData);
  },

  /**
   * Update an existing lab test
   */
  updateLabTest: async (
    labTestId: number,
    labTestData: Partial<LabTest>
  ): Promise<LabTest> => {
    return api.put<LabTest>(`/lab-tests/${labTestId}`, labTestData);
  },

  /**
   * Delete a lab test
   */
  deleteLabTest: async (labTestId: number): Promise<void> => {
    return api.delete(`/lab-tests/${labTestId}`);
  },

  /**
   * Get a paginated list of assigned tests
   */
  getAssignedTests: async (
    page: number = 1,
    limit: number = 10,
    status: TestStatus = TestStatus.PENDING
  ): Promise<PaginatedResponse<AssignedTest>> => {
    const params: Record<string, string | number> = {
      page,
      limit,
    };
    
    if (status) {
      params.status = status.toString();
    }

    return api.get<PaginatedResponse<AssignedTest>>("/assigned-tests", params);
  },

  /**
   * Get assigned test by ID
   */
  getAssignedTestById: async (assignedTestId: number): Promise<AssignedTest> => {
    return api.get<AssignedTest>(`/assigned-tests/${assignedTestId}`);
  },

  /**
   * Get assigned tests for an examination
   */
  getAssignedTestsByExamination: async (examinationId: number): Promise<AssignedTest[]> => {
    return api.get<AssignedTest[]>(`/assigned-tests/examination/${examinationId}`);
  },

  /**
   * Get assigned tests by status
   */
  getAssignedTestsByStatus: async (
    status: TestStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<AssignedTest>> => {
    return api.get<PaginatedResponse<AssignedTest>>(`/assigned-tests/status/${status.toString()}`, {
      page,
      limit,
    });
  },

  /**
   * Create a new assigned test
   */
  createAssignedTest: async (
    assignedTestData: Omit<AssignedTest, "id" | "assignedDate" | "status">
  ): Promise<AssignedTest> => {
    return api.post<AssignedTest>("/assigned-tests", assignedTestData);
  },

  /**
   * Update assigned test status
   */
  updateAssignedTestStatus: async (
    assignedTestId: number,
    status: TestStatus
  ): Promise<AssignedTest> => {
    return api.patch<AssignedTest>(`/assigned-tests/${assignedTestId}/status`, {
      status,
    });
  },

  /**
   * Get test result for an assigned test
   */
  getTestResult: async (assignedTestId: number): Promise<TestResult | null> => {
    return api.get<TestResult | null>(
      `/assigned-tests/${assignedTestId}/result`
    );
  },

  /**
   * Create or update test result
   */
  saveTestResult: async (
    assignedTestId: number,
    resultData: Omit<TestResult, "id" | "assignedTestId" | "resultDate">
  ): Promise<TestResult> => {
    return api.post<TestResult>(
      `/assigned-tests/${assignedTestId}/result`,
      resultData
    );
  },

  /**
   * Get assigned tests for a technician
   */
  getAssignedTestsByTechnician: async (
    technicianId: number,
    page: number = 1,
    limit: number = 10,
    status?: TestStatus
  ): Promise<PaginatedResponse<AssignedTest>> => {
    const params: Record<string, string | number> = {
      technicianId,
      page,
      limit,
    };
    
    if (status) {
      params.status = status.toString();
    }

    return api.get<PaginatedResponse<AssignedTest>>("/assigned-tests", params);
  },

  /**
   * Assign a technician to a test
   */
  assignTechnician: async (
    assignedTestId: number,
    technicianId: number
  ): Promise<AssignedTest> => {
    return api.patch<AssignedTest>(
      `/assigned-tests/${assignedTestId}/technician`,
      { technicianId }
    );
  },

  /**
   * Get test results for a patient
   */
  getPatientTestResults: async (patientId: number): Promise<TestResult[]> => {
    return api.get<TestResult[]>(`/patients/${patientId}/test-results`);
  },

  /**
   * Get recent test results with pagination
   */
  getRecentTestResults: async (
    page: number = 1,
    limit: number = 10
  ) => {
    return api.get<PaginatedResponse<TestResult>>("/test-results", {
      page,
      limit,
    });
  },
};

export default labTestService;
