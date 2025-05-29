// src/components/forms/ExaminationForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Examination, ExamStatus, Patient, LabTest } from "@/types";
import examinationService from "@/services/examinationService";
import patientService from "@/services/patientService";
import labTestService from "@/services/labTestService";
import AssignTestModal from "@/components/examinations/AssignTestModal";
import AuthStatusDebug from "@/components/auth/AuthStatusDebug";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, isAuthenticated, isHydrated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const isEditing = !!examinationId;

  // Debug authentication state
  useEffect(() => {
    console.log("🔍 ExaminationForm Debug:");
    console.log("- Auth user:", user);
    console.log("- Is authenticated:", isAuthenticated);
    console.log("- Is hydrated:", isHydrated);
    console.log("- User ID:", user?.id);
    console.log("- User role:", user?.role);
    console.log(
      "- localStorage token:",
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : "SSR"
    );
    console.log(
      "- localStorage user:",
      typeof window !== "undefined" ? localStorage.getItem("user") : "SSR"
    );
  }, [user, isAuthenticated, isHydrated]);

  // Update doctorId when user information becomes available
  useEffect(() => {
    if (user?.id) {
      console.log("Setting doctorId to:", user.id);
      setFormData((prev) => ({
        ...prev,
        doctorId: user.id,
      }));
    }
  }, [user?.id]);

  // Add validation for user authentication
  useEffect(() => {
    if (!isHydrated) {
      console.log("Auth context is not yet hydrated");
      return;
    }

    if (!isAuthenticated) {
      console.warn("User is not authenticated. Please log in.");
      setError("Please log in to create an examination.");
    } else if (!user?.id) {
      console.warn("User is authenticated but missing ID");
      setError("Authentication error: Missing user ID");
    } else {
      console.log("User is properly authenticated with ID:", user.id);
      setError(""); // Clear any previous error
    }
  }, [isAuthenticated, user?.id, isHydrated]);

  const [formData, setFormData] = useState<Partial<Examination>>({
    patientId: patientId || 0,
    doctorId: user?.id || 0,
    examDate: new Date().toISOString().split("T")[0],
    symptoms: "",
    diagnosis: "",
    notes: "",
    status: ExamStatus.SCHEDULED,
  });

  // Fetch patients and lab tests data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        console.log("Fetching patients and lab tests from API...");

        const [patientsRes, labTestsRes] = await Promise.all([
          patientService.getPatients(0, 100),
          labTestService.getLabTests(0, 100),
        ]);

        console.log("Patients response:", patientsRes);
        console.log("Lab tests response:", labTestsRes);

        if (patientsRes?.data) {
          setPatients(patientsRes.data);
          console.log("Set patients:", patientsRes.data);
        } else {
          console.warn("No patients data in response");
          setError("No patients found");
        }

        if (labTestsRes?.data) {
          setLabTests(labTestsRes.data);
          console.log("Set lab tests:", labTestsRes.data);
        } else {
          console.warn("No lab tests data in response");
          setError("No lab tests found");
        }
      } catch (err) {
        console.error("Error fetching data from API:", err);
        setError(
          "Failed to load data from server. Please check your connection and try again."
        );
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
            examDate: examination.examDate
              ? examination.examDate.split("T")[0]
              : examination.examinationDate
              ? examination.examinationDate.split("T")[0]
              : "",
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
    let processedValue: string | number = value;

    // Handle numeric values
    if (name === "patientId") {
      processedValue = parseInt(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isHydrated) {
      setError("Please wait while we load your authentication status...");
      return;
    }

    if (!isAuthenticated) {
      setError("Please log in to create an examination.");
      return;
    }

    if (!user?.id) {
      setError("Authentication error: Missing user ID");
      return;
    }

    if (!formData.patientId) {
      setError("Please select a patient");
      return;
    }

    if (!formData.symptoms?.trim()) {
      setError("Please enter symptoms");
      return;
    }

    if (!formData.diagnosis?.trim()) {
      setError("Please enter diagnosis");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let savedExamination: Examination;
      let newExaminationId: number | undefined;

      if (isEditing && examinationId) {
        // Update existing examination
        savedExamination = await examinationService.updateExamination(
          examinationId,
          formData
        );
        newExaminationId = examinationId;
      } else {
        // Create new examination using logged-in user as doctor
        const examinationData = {
          patientId: formData.patientId!,
          doctorId: user.id,
          examDate: formData.examDate!,
          examinationDate: formData.examDate!, // Backend expects this field name
          symptoms: formData.symptoms!,
          diagnosis: formData.diagnosis!,
          notes: formData.notes || "",
          status: ExamStatus.SCHEDULED,
        };

        console.log("Creating examination with data:", examinationData);
        savedExamination = await examinationService.createExamination(examinationData);
        newExaminationId = savedExamination.id;
      }

      // If we have selected tests, assign them to the examination
      if (selectedTests.length > 0 && newExaminationId) {
        await Promise.all(
          selectedTests.map(async (testId) => {
            await api.post("/assigned-tests", {
              examinationId: newExaminationId,
              labTestId: testId,
            });
          })
        );
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/examinations");
      }
    } catch (err) {
      console.error("Failed to save examination:", err);

      // Provide more specific error messages based on the error type
      if (err instanceof Error && err.message.includes("403")) {
        setError(
          "Access denied. You don't have permission to create examinations. Please check your login status and role permissions."
        );
      } else if (err instanceof Error && err.message.includes("401")) {
        setError("Authentication required. Please log in again.");
      } else if (err instanceof Error && err.message.includes("400")) {
        setError(
          "Invalid data provided. Please check all required fields are filled correctly."
        );
      } else {
        setError("Failed to save examination. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestChange = (testId: number) => {
    setSelectedTests((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((id) => id !== testId);
      } else {
        return [...prev, testId];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthStatusDebug />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-10.293a1 1 0 111.414-1.414l3 3a1 1 0 01-1.414 1.414L11 9.414V13a1 1 0 11-2 0V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Selection */}
      <div>
        <label
          htmlFor="patient"
          className="block text-sm font-medium text-gray-700"
        >
          Patient
        </label>
        <select
          id="patient"
          name="patientId"
          value={formData.patientId || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lab Tests Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lab Tests
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
          {labTests.map((test) => (
            <div key={test.id} className="flex items-center">
              <input
                type="checkbox"
                id={`test-${test.id}`}
                checked={selectedTests.includes(test.id)}
                onChange={() => handleTestChange(test.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`test-${test.id}`}
                className="ml-2 block text-sm text-gray-900"
              >
                {test.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="examDate"
          className="block text-sm font-medium text-gray-700"
        >
          Examination Date
        </label>
        <input
          type="date"
          id="examDate"
          name="examDate"
          value={formData.examDate || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="symptoms"
          className="block text-sm font-medium text-gray-700"
        >
          Symptoms
        </label>
        <textarea
          id="symptoms"
          name="symptoms"
          rows={3}
          value={formData.symptoms || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="diagnosis"
          className="block text-sm font-medium text-gray-700"
        >
          Diagnosis
        </label>
        <textarea
          id="diagnosis"
          name="diagnosis"
          rows={3}
          value={formData.diagnosis || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-between">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading
            ? "Saving..."
            : isEditing
            ? "Update Examination"
            : "Create Examination"}
        </button>
      </div>

      {showAssignModal && examinationId && (
        <AssignTestModal
          examinationId={examinationId}
          onAssign={() => {}}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </form>
  );
}