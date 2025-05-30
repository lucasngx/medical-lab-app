export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
} 