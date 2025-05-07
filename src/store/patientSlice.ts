import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Patient, PaginatedResponse, ApiError } from "../types";

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: PatientState = {
  patients: [],
  selectedPatient: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const fetchPatients = createAsyncThunk(
  "patients/fetchAll",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/patients?page=${page}&limit=${limit}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data: PaginatedResponse<Patient> = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  "patients/fetchById",
  async (patientId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patient details");
      }

      const patient: Patient = await response.json();
      return patient;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPatient = createAsyncThunk(
  "patients/create",
  async (
    patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || "Failed to create patient");
      }

      const newPatient: Patient = await response.json();
      return newPatient;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePatient = createAsyncThunk(
  "patients/update",
  async (
    { id, patientData }: { id: number; patientData: Partial<Patient> },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        throw new Error("Failed to update patient");
      }

      const updatedPatient: Patient = await response.json();
      return updatedPatient;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePatient = createAsyncThunk(
  "patients/delete",
  async (patientId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }

      return patientId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch patients
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch patient by ID
      .addCase(fetchPatientById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create patient
      .addCase(createPatient.fulfilled, (state, action) => {
        state.patients.push(action.payload);
        state.pagination.total += 1;
      })
      // Update patient
      .addCase(updatePatient.fulfilled, (state, action) => {
        const index = state.patients.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        if (
          state.selectedPatient &&
          state.selectedPatient.id === action.payload.id
        ) {
          state.selectedPatient = action.payload;
        }
      })
      // Delete patient
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter((p) => p.id !== action.payload);
        state.pagination.total -= 1;
        if (
          state.selectedPatient &&
          state.selectedPatient.id === action.payload
        ) {
          state.selectedPatient = null;
        }
      });
  },
});

export const { clearSelectedPatient, setPage, setLimit } = patientSlice.actions;
export default patientSlice.reducer;
