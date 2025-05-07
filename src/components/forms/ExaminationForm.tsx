// src/components/forms/ExaminationForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { Examination, ExamStatus, Patient, Doctor, Role } from "@/types";
import examinationService from "@/services/examinationService";
import patientService from "@/services/patientService";
import api from "@/services/api";

interface ExaminationFormProps {
  examinationId?: number;
  patientId?: number;
  onSuccess?: () => void;
}

export default function ExaminationForm({
  examinationId,
  patientId,
  onSuccess,
}: ExaminationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState<Partial<Examination>>({
    patientId: patientId || 0,
    doctorId: 0,
    examDate: new Date().toISOString().split("T")[0],
    symptoms: "",
    notes: "",
    status: ExamStatus.PENDING,
  });

  const isEditing = !!examinationId;

  // Fetch doctors and patients data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          patientService.getPatients(1, 100),
          api.get<Doctor[]>("/doctors"),
        ]);

        console.log("Patients:", patientsRes);
        console.log("Doctors:", doctorsRes);
        
        if (patientsRes?.data) {
          setPatients(patientsRes.data);
        }
        
        if (doctorsRes) {
          setDoctors(doctorsRes);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load required data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch examination data if editing
  useEffect(() => {
    if (examinationId) {
      setIsLoading(true);
      examinationService
        .getExaminationById(examinationId)
        .then((examination) => {
          setFormData({
            ...examination,
            examDate: examination.examDate.split("T")[0],
          });
        })
        .catch((err) => {
          setError("Failed to load examination data");
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [examinationId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let processedValue: any = value;

    // Handle numeric values
    if (name === "patientId" || name === "doctorId") {
      processedValue = parseInt(value, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isEditing && examinationId) {
        await examinationService.updateExamination(examinationId, formData);
      } else {
        await examinationService.createExamination(
          formData as Omit<Examination, "id" | "createdAt" | "updatedAt">
        );
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/examinations");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save examination");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="patientId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Patient *
          </label>
          <div className="relative">
            <select
              id="patientId"
              name="patientId"
              required
              value={formData.patientId || ""}
              onChange={handleChange}
              disabled={!!patientId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({new Date(patient.dob).toLocaleDateString()})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
          {!patientId && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => router.push("/patients/new")}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Plus size={14} className="mr-1" />
                Add New Patient
              </button>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="doctorId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Doctor *
          </label>
          <div className="relative">
            <select
              id="doctorId"
              name="doctorId"
              required
              value={formData.doctorId || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.specialization})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="examDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Examination Date *
          </label>
          <input
            type="date"
            id="examDate"
            name="examDate"
            required
            value={formData.examDate || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status *
          </label>
          <div className="relative">
            <select
              id="status"
              name="status"
              required
              value={formData.status || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value={ExamStatus.PENDING}>Pending</option>
              <option value={ExamStatus.IN_PROGRESS}>In Progress</option>
              <option value={ExamStatus.COMPLETED}>Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="symptoms"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Symptoms *
          </label>
          <textarea
            id="symptoms"
            name="symptoms"
            required
            rows={3}
            value={formData.symptoms || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe patient symptoms..."
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional examination notes..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push("/examinations")}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading
            ? "Saving..."
            : isEditing
            ? "Update Examination"
            : "Create Examination"}
        </button>
      </div>
    </form>
  );
}
