// src/utils/mockData.ts

import { 
  Patient, 
  Doctor, 
  Examination, 
  LabTest, 
  AssignedTest,
  TestResult,
  Prescription,
  PrescriptionItem,
  Medication,
  ExamStatus,
  TestStatus,
  ResultStatus,
  Role
} from '@/types';

export const mockPatients: Patient[] = [
  {
    id: 1,
    name: "John Doe",
    dob: "1985-03-15",
    gender: "Male",
    phone: "123-456-7890",
    email: "john.doe@email.com",
    address: "123 Main St, Anytown, USA",
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2025-01-15T08:00:00Z"
  },
  {
    id: 2,
    name: "Jane Smith",
    dob: "1990-07-22",
    gender: "Female",
    phone: "234-567-8901",
    email: "jane.smith@email.com",
    address: "456 Oak Ave, Somewhere, USA",
    createdAt: "2025-02-01T09:30:00Z",
    updatedAt: "2025-02-01T09:30:00Z"
  },
  {
    id: 3,
    name: "Robert Johnson",
    dob: "1978-11-30",
    gender: "Male",
    phone: "345-678-9012",
    email: "robert.j@email.com",
    address: "789 Pine Rd, Elsewhere, USA",
    createdAt: "2025-03-10T14:15:00Z",
    updatedAt: "2025-03-10T14:15:00Z"
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Williams",
    specialization: "Internal Medicine",
    phone: "456-789-0123",
    email: "dr.williams@hospital.com",
    role: Role.DOCTOR
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialization: "Cardiology",
    phone: "567-890-1234",
    email: "dr.chen@hospital.com",
    role: Role.DOCTOR
  }
];

export const mockLabTests: LabTest[] = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    description: "Measures different components of blood",
    unit: "varies",
    refRange: { min: 0, max: 0 } // Varies by component
  },
  {
    id: 2,
    name: "Blood Glucose Test",
    description: "Measures blood sugar levels",
    unit: "mg/dL",
    refRange: { min: 70, max: 100 }
  },
  {
    id: 3,
    name: "Lipid Panel",
    description: "Measures cholesterol and triglycerides",
    unit: "mg/dL",
    refRange: { min: 0, max: 200 }
  },
  {
    id: 4,
    name: "Thyroid Function Test",
    description: "Measures thyroid hormone levels",
    unit: "mIU/L",
    refRange: { min: 0.4, max: 4.0 }
  }
];

export const mockExaminations: Examination[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    examDate: "2025-04-20T09:00:00Z",
    symptoms: "Fatigue, headache, dizziness",
    notes: "Patient reports symptoms persisting for 2 weeks",
    status: ExamStatus.IN_PROGRESS,
    createdAt: "2025-04-20T09:00:00Z",
    updatedAt: "2025-04-20T09:00:00Z",
    patient: mockPatients[0],
    doctor: mockDoctors[0]
  },
  {
    id: 2,
    patientId: 2,
    doctorId: 2,
    examDate: "2025-04-21T10:30:00Z",
    symptoms: "Chest pain, shortness of breath",
    notes: "Requires immediate cardiac evaluation",
    status: ExamStatus.COMPLETED,
    createdAt: "2025-04-21T10:30:00Z",
    updatedAt: "2025-04-21T15:45:00Z",
    patient: mockPatients[1],
    doctor: mockDoctors[1]
  }
];

export const mockAssignedTests: AssignedTest[] = [
  {
    id: 1,
    examinationId: 1,
    labTestId: 1,
    status: TestStatus.COMPLETED,
    assignedDate: "2025-04-20T09:30:00Z",
    labTest: mockLabTests[0]
  },
  {
    id: 2,
    examinationId: 1,
    labTestId: 2,
    status: TestStatus.IN_PROGRESS,
    assignedDate: "2025-04-20T09:30:00Z",
    labTest: mockLabTests[1]
  },
  {
    id: 3,
    examinationId: 2,
    labTestId: 3,
    status: TestStatus.PENDING,
    assignedDate: "2025-04-21T11:00:00Z",
    labTest: mockLabTests[2]
  }
];

export const mockMedications: Medication[] = [
  {
    id: 1,
    name: "Amoxicillin",
    dosageInfo: "500mg",
    sideEffects: "Nausea, diarrhea, rash"
  },
  {
    id: 2,
    name: "Lisinopril",
    dosageInfo: "10mg",
    sideEffects: "Dizziness, cough, headache"
  },
  {
    id: 3,
    name: "Metformin",
    dosageInfo: "850mg",
    sideEffects: "Stomach upset, metallic taste"
  }
];

export const mockPrescriptions: Prescription[] = [
  {
    id: 1,
    examinationId: 1,
    diagnosis: "Iron deficiency anemia",
    createdAt: "2025-04-20T10:00:00Z",
    notes: "Follow up in 2 weeks",
    items: [
      {
        id: 1,
        prescriptionId: 1,
        medicationId: 1,
        dosage: "500mg",
        frequency: "Twice daily",
        duration: "7 days",
        medication: mockMedications[0]
      }
    ]
  },
  {
    id: 2,
    examinationId: 2,
    diagnosis: "Hypertension",
    createdAt: "2025-04-21T11:30:00Z",
    notes: "Monitor blood pressure daily",
    items: [
      {
        id: 2,
        prescriptionId: 2,
        medicationId: 2,
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        medication: mockMedications[1]
      }
    ]
  }
];