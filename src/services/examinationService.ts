import api from "@/services/api";
import { Examination, ExamStatus, PaginatedResponse } from "@/types";
import { AxiosError } from "axios";

const examinationService = {
  /**
   * Get a paginated list of examinations
   */
  getExaminations: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Examination>> => {
    const response = await api.get<PaginatedResponse<Examination>>(
      "/api/examinations",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * Get an examination by ID
   */
  getExaminationById: async (examinationId: number): Promise<Examination> => {
    const response = await api.get<Examination>(
      `/api/examinations/${examinationId}`
    );
    return response.data;
  },

  /**
   * Get examinations by patient ID
   */
  getExaminationsByPatient: async (
    patientId: number
  ): Promise<Examination[]> => {
    const response = await api.get<Examination[]>(
      `/api/examinations/patient/${patientId}`
    );
    return response.data;
  },

  /**
   * Get examinations by doctor ID
   */
  getExaminationsByDoctor: async (doctorId: number): Promise<Examination[]> => {
    const response = await api.get<Examination[]>(
      `/api/examinations/doctor/${doctorId}`
    );
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
    try {
      const response = await api.get<PaginatedResponse<Examination>>(
        `/api/examinations/status/${status}`,
        {
          params: { page, limit }
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching examinations by status:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(`Failed to fetch examinations: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  },

  /**
   * Search examinations by patient name and status
   */
  searchExaminations: async (params: {
    patientName?: string;
    status?: ExamStatus;
  }): Promise<PaginatedResponse<Examination>> => {
    const response = await api.get<PaginatedResponse<Examination>>(
      "/api/examinations/search",
      {
        params,
      }
    );
    return response.data;
  },

  /**
   * Create a new examination
   */
  createExamination: async (
    examinationData: Omit<Examination, "id" | "createdAt" | "updatedAt">
  ): Promise<Examination> => {
    try {
      // Ensure all required fields are present
      if (!examinationData.patientId || !examinationData.doctorId || !examinationData.examDate) {
        throw new Error("Missing required fields: patientId, doctorId, or examDate");
      }

      // Map frontend field names to backend field names
      const backendData = {
        patient: { id: examinationData.patientId },
        doctor: { id: examinationData.doctorId },
        examinationDate: examinationData.examDate,
        symptoms: examinationData.symptoms || '',
        diagnosis: examinationData.diagnosis || '',
        notes: examinationData.notes || '',
        status: examinationData.status || ExamStatus.SCHEDULED
      };

      const response = await api.post<Examination>(
        "/api/examinations",
        backendData
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error creating examination:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
      throw error;
    }
  },

  /**
   * Update an examination
   */
  updateExamination: async (
    examinationId: number,
    examinationData: Partial<Examination>
  ): Promise<Examination> => {
    // Map frontend field names to backend field names if examDate is present
    let backendData = { ...examinationData };
    if (examinationData.examDate) {
      backendData = {
        ...examinationData,
        examinationDate: examinationData.examDate,
      };
      // Remove frontend-specific field
      const { examDate, ...finalData } = backendData as Examination & {
        examDate?: string;
      };
      backendData = finalData;
    }

    const response = await api.put<Examination>(
      `/api/examinations/${examinationId}`,
      backendData
    );
    return response.data;
  },

  /**
   * Update examination status
   */
  updateExaminationStatus: async (
    examinationId: number,
    status: ExamStatus
  ): Promise<Examination> => {
    const response = await api.put<Examination>(
      `/api/examinations/${examinationId}/status`,
      null,
      {
        params: { status },
      }
    );
    return response.data;
  },

  /**
   * Delete an examination
   */
  deleteExamination: async (examinationId: number): Promise<void> => {
    await api.delete(`/api/examinations/${examinationId}`);
  },
};

export default examinationService;
