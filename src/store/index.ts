import { configureStore } from "@reduxjs/toolkit";
import patientReducer from "./patientSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    patients: patientReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
