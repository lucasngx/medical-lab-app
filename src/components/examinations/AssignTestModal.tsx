// src/components/examinations/AssignTestModal.tsx

"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LabTest, Patient, Examination } from "@/types";
import labTestService from "@/services/labTestService";
import examinationService from "@/services/examinationService";
import patientService from "@/services/patientService";

interface AssignTestModalProps {
  examinationId?: number;
  preSelectedTestIds?: number[];
  onAssign: (labTestId: number, examinationId: number) => void;
  onClose?: () => void;
}

export default function AssignTestModal({
  examinationId,
  preSelectedTestIds,
  onAssign,
  onClose,
}: AssignTestModalProps) {
  const [selectedTests, setSelectedTests] = useState<number[]>(
    preSelectedTestIds || []
  );
  const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [selectedExaminationId, setSelectedExaminationId] = useState<
    number | null
  >(examinationId || null);
  const [isLoading, setIsLoading] = useState({
    tests: true,
    patients: false,
    examinations: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await labTestService.getLabTests(1, 100);
        if ("data" in response) {
          setAvailableTests(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch lab tests:", err);
        setError("Failed to load available tests");
      } finally {
        setIsLoading((prev) => ({ ...prev, tests: false }));
      }
    };

    const fetchPatients = async () => {
      if (!examinationId) {
        setIsLoading((prev) => ({ ...prev, patients: true }));
        try {
          const response = await patientService.getPatients(0, 100);
          setPatients(response.data);
        } catch (err) {
          console.error("Failed to fetch patients:", err);
          setError("Failed to load patients");
        } finally {
          setIsLoading((prev) => ({ ...prev, patients: false }));
        }
      }
    };

    fetchTests();
    fetchPatients();
  }, [examinationId]);

  useEffect(() => {
    const fetchExaminations = async () => {
      if (selectedPatientId) {
        setIsLoading((prev) => ({ ...prev, examinations: true }));
        try {
          const response = await examinationService.getExaminationsByPatient(
            selectedPatientId
          );
          setExaminations(response);
        } catch (err) {
          console.error("Failed to fetch examinations:", err);
          setError("Failed to load examinations");
        } finally {
          setIsLoading((prev) => ({ ...prev, examinations: false }));
        }
      }
    };

    if (selectedPatientId) {
      fetchExaminations();
    }
  }, [selectedPatientId]);

  const handleTestToggle = (testId: number) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const handleAssign = () => {
    if (selectedExaminationId) {
      selectedTests.forEach((testId) => {
        onAssign(testId, selectedExaminationId);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Assign Lab Tests</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-grow overflow-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {!examinationId && (
            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Patient
                </label>
                <select
                  value={selectedPatientId || ""}
                  onChange={(e) => {
                    setSelectedPatientId(Number(e.target.value));
                    setSelectedExaminationId(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading.patients}
                >
                  <option value="">Select a patient...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {isLoading.patients && (
                  <div className="text-sm text-gray-500">
                    Loading patients...
                  </div>
                )}
              </div>

              {selectedPatientId && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Examination
                  </label>
                  <select
                    value={selectedExaminationId || ""}
                    onChange={(e) =>
                      setSelectedExaminationId(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading.examinations}
                  >
                    <option value="">Select an examination...</option>
                    {examinations.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {new Date(exam.examDate).toLocaleDateString()} -{" "}
                        {exam.symptoms.slice(0, 50)}...
                      </option>
                    ))}
                  </select>
                  {isLoading.examinations && (
                    <div className="text-sm text-gray-500">
                      Loading examinations...
                    </div>
                  )}
                  {!isLoading.examinations && examinations.length === 0 && (
                    <div className="text-sm text-red-500">
                      No examinations found for this patient
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Tests to Assign
            </label>
            {isLoading.tests ? (
              <div className="flex justify-center p-4">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto border rounded-md p-2">
                {availableTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`test-${test.id}`}
                      checked={selectedTests.includes(test.id)}
                      onChange={() => handleTestToggle(test.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`test-${test.id}`}
                      className="flex-grow cursor-pointer"
                    >
                      <div className="font-medium text-gray-900">
                        {test.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {test.description}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="inline-block mr-4">
                          Unit: {test.unit}
                        </span>
                        <span>
                          Range: {test.refRange.min} - {test.refRange.max}
                        </span>
                      </div>
                    </label>
                  </div>
                ))}

                {availableTests.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No lab tests available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={
              selectedTests.length === 0 ||
              !selectedExaminationId ||
              isLoading.tests
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {selectedTests.length === 0
              ? "Select Tests to Assign"
              : `Assign ${selectedTests.length} Test${
                  selectedTests.length > 1 ? "s" : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}
