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
    const response = await api.get<PaginatedResponse<Examination>>(
      `/api/examinations/status/${status}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
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
    const authHeader = api.defaults.headers.common['Authorization'];
    console.log("Creating new examination:", {
      data: examinationData,
      apiHeaders: {
        hasAuthHeader: !!authHeader,
        authHeaderPreview: typeof authHeader === 'string' ? authHeader.substring(0, 20) + '...' : 'Not a string'
      }
    });

    try {
      // Map frontend field names to backend field names
      const backendData = {
        ...examinationData,
        examinationDate: examinationData.examDate, // Backend expects examinationDate
      };

      // Remove frontend-specific field
      const { examDate, ...finalData } = backendData as Examination & {
        examDate?: string;
      };

      console.log("Sending examination data to backend:", finalData);

      const response = await api.post<Examination>(
        "/api/examinations",
        finalData
      );

      console.log("Examination creation response:", {
        status: response.status,
        hasData: !!response.data,
        examinationId: response.data?.id
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error creating examination:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      } else {
        console.error("Unknown error creating examination:", error);
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
