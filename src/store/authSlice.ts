import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role } from "@/types";

interface User {
  id: number;
  name: string;
  role: Role;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  savedCredentials: { email: string; password: string } | null;
  rememberMe: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  savedCredentials: null,
  rememberMe: false
};

export const authSlice = createSlice({
  name: "auth",
  initialState,  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    setSavedCredentials: (state, action: PayloadAction<{ email: string; password: string } | null>) => {
      state.savedCredentials = action.payload;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (!state.rememberMe) {
        state.savedCredentials = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setUser, 
  setToken, 
  setSavedCredentials, 
  setRememberMe, 
  clearAuth, 
  setLoading, 
  setError 
} = authSlice.actions;
export default authSlice.reducer;