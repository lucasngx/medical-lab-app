export enum ExamStatus {
  SCHEDULED = "SCHEDULED", // Changed from PENDING to match backend
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED", // Added to match backend
}

export enum TestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

export enum ResultStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED"
}

export enum Role {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  TECHNICIAN = "TECHNICIAN",
  PATIENT = "PATIENT"
}

export interface ReferenceRange {
  min: number;
  max: number;
}

export interface Patient {
  id: number;
  name: string;
  dateOfBirth: string;
  dob: string; // Alias for dateOfBirth for backward compatibility
  gender: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  role: Role.DOCTOR;
}

export interface Technician {
  id: number;
  name: string;
  department: string;
  phone: string;
  email: string;
  role: Role.TECHNICIAN;
}

export interface Examination {
  id: number;
  patientId: number;
  doctorId: number;
  examDate: string; // Frontend field name
  examinationDate: string; // Backend field name
  symptoms: string;
  diagnosis: string; // Required by backend
  notes: string;
  status: ExamStatus;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface LabTest {
  id: number;
  name: string;
  code: string;
  description: string;
  price: number;
  status: string;
  unit: string;
  refRange: ReferenceRange;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: number;
  technician: Technician;
  patient: Patient;
  test: LabTest;
  assignedTestId: number;
  resultData: string;
  result: string;
  notes: string;
  resultDate: string;
  status: ResultStatus;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedTest {
  id: number;
  examinationId: number;
  labTestId: number;
  patientId: number;
  status: TestStatus;
  assignedDate: string;
  test?: LabTest;
  patientName?: string;
}

export interface Prescription {
  id: number;
  examinationId: number;
  diagnosis: string;
  createdAt: string;
  notes: string;
  items?: PrescriptionItem[];
  doctor?: Doctor;
  patient?: Patient;
  examination?: Examination;
}

export interface Medication {
  id: number;
  name: string;
  dosageInfo: string;
  sideEffects: string;
}

export interface PrescriptionItem {
  id: number;
  prescriptionId: number;
  medicationId: number;
  dosage: string;
  duration: string;
  frequency: string;
  medication?: Medication;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface Organization {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  organization: Organization;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  organizationId: number;
  organization?: Organization;
  phone?: string;
  department?: string;
  specialization?: string;
  organizationName?: string;
}
