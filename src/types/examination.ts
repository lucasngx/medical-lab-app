export interface Examination {
  id: number;
  patientId: number;
  doctorId: number;
  examinationDate: Date;
  diagnosis: string;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
} 