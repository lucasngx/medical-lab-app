import { api } from '@/config/api';
import { Examination, ExamStatus, PaginatedResponse } from "@/types";

const examinationService = {
  /**
   * Get a paginated list of examinations
   */
  getExaminations: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Examination>> => {
    const response = await api.get<PaginatedResponse<Examination>>('/api/examinations', {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Get an examination by ID
   */
  getExaminationById: async (examinationId: number): Promise<Examination> => {
    const response = await api.get<Examination>(`/api/examinations/${examinationId}`);
    return response.data;
  },

  /**
   * Get examinations by patient ID
   */
  getExaminationsByPatient: async (patientId: number): Promise<Examination[]> => {
    const response = await api.get<Examination[]>(`/api/examinations/patient/${patientId}`);
    return response.data;
  },

  /**
   * Get examinations by doctor ID
   */
  getExaminationsByDoctor: async (doctorId: number): Promise<Examination[]> => {
    const response = await api.get<Examination[]>(`/api/examinations/doctor/${doctorId}`);
    return response.data;
  },

  /**
   * Get examinations by status
   */
  getExaminationsByStatus: async (
    status: ExamStatus,
    page: number = 0,
    limit: number = 10
  ): Promise<PaginatedResponse<Examination>> => {
    const response = await api.get<PaginatedResponse<Examination>>(`/api/examinations/status/${status}`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Search examinations by patient name and status
   */
  searchExaminations: async (params: {
    patientName?: string;
    status?: ExamStatus;
  }): Promise<PaginatedResponse<Examination>> => {
    const response = await api.get<PaginatedResponse<Examination>>('/api/examinations/search', {
      params
    });
    return response.data;
  },

  /**
   * Create a new examination
   */
  createExamination: async (
    examinationData: Omit<Examination, "id" | "createdAt" | "updatedAt">
  ): Promise<Examination> => {
    const response = await api.post<Examination>('/api/examinations', examinationData);
    return response.data;
  },

  /**
   * Update an examination
   */
  updateExamination: async (
    examinationId: number,
    examinationData: Partial<Examination>
  ): Promise<Examination> => {
    const response = await api.put<Examination>(`/api/examinations/${examinationId}`, examinationData);
    return response.data;
  },

  /**
   * Update examination status
   */
  updateExaminationStatus: async (
    examinationId: number,
    status: ExamStatus
  ): Promise<Examination> => {
    const response = await api.put<Examination>(`/api/examinations/${examinationId}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  /**
   * Delete an examination
   */
  deleteExamination: async (examinationId: number): Promise<void> => {
    await api.delete(`/api/examinations/${examinationId}`);
  }
};

export default examinationService;
