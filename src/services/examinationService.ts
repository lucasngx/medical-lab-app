import api from "./api";
import { Examination, ExamStatus, AssignedTest, PaginatedResponse } from "@/types";

const examinationService = {
  /**
   * Get a paginated list of examinations
   */
  getExaminations: async (
    page: number = 1,
    limit: number = 10,
    status: ExamStatus = ExamStatus.PENDING
  ): Promise<PaginatedResponse<Examination>> => {
    return await api.get<PaginatedResponse<Examination>>("/examinations", {
      page,
      limit,
      status,
    });
  },

  /**
   * Get an examination by ID
   */
  getExaminationById: async (examinationId: number): Promise<Examination> => {
    return api.get<Examination>(`/examinations/${examinationId}`);
  },

  /**
   * Get examinations by patient ID
   */
  getExaminationsByPatient: async (
    patientId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Examination>> => {
    return api.get<PaginatedResponse<Examination>>(`/examinations/patient/${patientId}`, {
      page,
      limit,
    });
  },

  /**
   * Get examinations by doctor ID
   */
  getExaminationsByDoctor: async (
    doctorId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Examination>> => {
    return api.get<PaginatedResponse<Examination>>(`/examinations/doctor/${doctorId}`, {
      page,
      limit,
    });
  },

  /**
   * Get examinations by status
   */
  getExaminationsByStatus: async (
    status: ExamStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Examination>> => {
    return api.get<PaginatedResponse<Examination>>(`/examinations/status/${status}`, {
      page,
      limit,
    });
  },

  /**
   * Create a new examination
   */
  createExamination: async (
    examinationData: Omit<Examination, "id" | "createdAt" | "updatedAt">
  ): Promise<Examination> => {
    return api.post<Examination>("/examinations", examinationData);
  },

  /**
   * Update examination status
   */
  updateExaminationStatus: async (
    examinationId: number,
    status: ExamStatus
  ): Promise<Examination> => {
    return api.patch<Examination>(`/examinations/${examinationId}/status`, { status });
  },

  /**
   * Update an examination
   */
  updateExamination: async (
    examinationId: number,
    examinationData: Partial<Examination>
  ): Promise<Examination> => {
    return api.put<Examination>(`/examinations/${examinationId}`, examinationData);
  },

  /**
   * Get all tests assigned to an examination
   */
  getAssignedTests: async (examinationId: number): Promise<AssignedTest[]> => {
    return api.get<AssignedTest[]>(`/examinations/${examinationId}/tests`);
  },

  /**
   * Assign a lab test to an examination
   */
  assignTest: async (
    examinationId: number,
    labTestId: number
  ): Promise<AssignedTest> => {
    return api.post<AssignedTest>(`/examinations/${examinationId}/tests`, {
      labTestId,
    });
  },

  /**
   * Assign multiple lab tests to an examination
   */
  assignTests: async (
    examinationId: number,
    labTestIds: number[]
  ): Promise<AssignedTest[]> => {
    return api.post<AssignedTest[]>(
      `/examinations/${examinationId}/tests/batch`,
      { labTestIds }
    );
  },

  /**
   * Remove a test assignment
   */
  removeAssignedTest: async (
    examinationId: number,
    assignedTestId: number
  ): Promise<void> => {
    return api.delete(`/api/examinations/${examinationId}/tests/${assignedTestId}`);
  },

  /**
   * Search examinations by patient name or doctor name
   */
  searchExaminations: async (
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Examination>> => {
    return api.get<PaginatedResponse<Examination>>("/api/examinations/search", {
      query,
      page,
      limit,
    });
  },
};

export default examinationService;
