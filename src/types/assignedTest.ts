import { LabTest } from './labTest';
import { Patient } from './patient';
import { Doctor } from './doctor';
import { Technician } from './technician';
import { Examination } from './examination';

export enum TestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface AssignedTest {
  id: number;
  test: LabTest;
  patient: Patient;
  doctor: Doctor;
  technician?: Technician;
  examination: Examination;
  result?: string;
  notes?: string;
  status: TestStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedDate: Date;
} 