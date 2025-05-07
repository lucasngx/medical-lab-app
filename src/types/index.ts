export enum ExamStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum TestStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ResultStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED",
}

export enum Role {
  DOCTOR = "DOCTOR",
  TECHNICIAN = "TECHNICIAN",
  ADMIN = "ADMIN",
}

export interface ReferenceRange {
  min: number;
  max: number;
}

export interface Patient {
  id: number;
  name: string;
  dob: string;
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
  examDate: string;
  symptoms: string;
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
  description: string;
  unit: string;
  refRange: ReferenceRange;
}

export interface AssignedTest {
  id: number;
  examinationId: number;
  labTestId: number;
  status: TestStatus;
  assignedDate: string;
  labTest?: LabTest;
  result?: TestResult;
}

export interface TestResult {
  id: number;
  assignedTestId: number;
  technicianId: number;
  resultData: string;
  resultDate: string;
  status: ResultStatus;
  comment: string;
  technician?: Technician;
}

export interface Prescription {
  id: number;
  examinationId: number;
  diagnosis: string;
  createdAt: string;
  notes: string;
  items?: PrescriptionItem[];
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

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}
