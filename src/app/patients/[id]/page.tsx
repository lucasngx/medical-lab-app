"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import patientService from "../../../services/patientService";
import examinationService from "../../../services/examinationService";
import { formatDateToLocale, calculateAge } from "../../../utils/dateUtils";
import { Patient, Examination, TestResult } from "../../../types";
import { useNotification } from "../../../hooks/useNotification";
import PatientCard from "../../../components/patients/PatientCard";
import PatientHistory from "../../../components/patients/PatientHistory";

const PatientDetailPage = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "info" | "examinations" | "tests" | "prescriptions"
  >("info");

  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchPatientData = async () => {
      setIsLoading(true);
      try {
        const patientId = parseInt(id as string);

        // Fetch patient details
        const patientData = await patientService.getPatientById(patientId);
        setPatient(patientData);

        // Fetch patient examinations
        const examinationData = await patientService.getPatientExaminations(
          patientId
        );
        setExaminations(examinationData);

        // Fetch patient test results
        const testData = await labTestService.getPatientTestResults(patientId);
        setTestResults(testData);
      } catch (error) {
        console.error("Failed to fetch patient data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [id, router]);

  const handleEdit = () => {
    router.push(`/patients/${id}/edit`);
  };

  const handleCreateExamination = () => {
    router.push(`/examinations/new?patientId=${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Patient not found. The patient may have been deleted or you
                might not have access.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Patient: {patient.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit Patient
          </button>
          <button
            onClick={handleCreateExamination}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            New Examination
          </button>
        </div>
      </div>

      {/* Patient Summary */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "info"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Patient Info
          </button>
          <button
            onClick={() => setActiveTab("examinations")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "examinations"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Examinations
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "tests"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Test Results
          </button>
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "prescriptions"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Prescriptions
          </button>
        </div>

        <div className="p-6">
          {activeTab === "info" && <PatientCard patient={patient} />}

          {activeTab === "examinations" && (
            <PatientHistory
              examinations={examinations}
              onViewExamination={(examId) =>
                router.push(`/examinations/${examId}`)
              }
            />
          )}

          {activeTab === "tests" && (
            <div>
              {testResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {/* This would need to map to actual test name from assignedTest.labTest.name */}
                            Test #{result.assignedTestId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {result.resultData}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateToLocale(result.resultDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                result.status === "REVIEWED"
                                  ? "bg-green-100 text-green-800"
                                  : result.status === "SUBMITTED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">
                  No test results available for this patient.
                </p>
              )}
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div>
              {/* Prescription history would be shown here */}
              <p className="text-gray-500 text-center py-6">
                Prescription history will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
