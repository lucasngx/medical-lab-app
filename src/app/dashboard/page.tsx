"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import patientService from "../../services/patientService";
import examinationService from "../../services/examinationService";
import labTestService from "../../services/labTestService";
import prescriptionService from "../../services/prescriptionService"; // Import prescriptionService
import { formatDateToLocale } from "../../utils/dateUtils";
import {
  ExamStatus,
  TestStatus,
  ResultStatus,
  Patient,
  Examination,
  AssignedTest,
  TestResult,
  Prescription, // Add Prescription type
} from "../../types";

interface DashboardStats {
  totalPatients: number;
  recentPatients: Patient[];
  pendingExaminations: number;
  completedExaminations: number;
  pendingTests: number;
  completedTests: number;
  recentExaminations: Examination[];
  pendingLabTests: AssignedTest[];
  recentTestResults: TestResult[];
  recentPrescriptions: Prescription[]; // Add prescriptions
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    recentPatients: [],
    pendingExaminations: 0,
    completedExaminations: 0,
    pendingTests: 0,
    completedTests: 0,
    recentExaminations: [],
    pendingLabTests: [],
    recentTestResults: [],
    recentPrescriptions: [], // Initialize prescriptions
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch patient data
        const patientData = await patientService.getPatients(1, 5);
        console.log("Patient Data:", patientData.total);

        // Fetch examination data
        const pendingExams = await examinationService.getExaminations(1, 100, ExamStatus.PENDING);
        const completedExams = await examinationService.getExaminations(1, 100, ExamStatus.COMPLETED);
        const recentExams = await examinationService.getExaminations(1, 5);
        console.log("Recent Examinations:", recentExams);
        console.log("Pending Examinations:", pendingExams);
        console.log("Completed Examinations:", completedExams);
        // Fetch lab test data
        const pendingTests = await labTestService.getAssignedTests(1, 100, TestStatus.PENDING);
        const completedTests = await labTestService.getAssignedTests(1, 100, TestStatus.COMPLETED);
        console.log("Pending Lab Tests:", pendingTests);
        console.log("Completed Lab Tests:", completedTests);
        // Fetch recent test results with error handling
        let recentResults: { data: TestResult[]; total: number } = { data: [], total: 0 };
        try {
          const testResults = await labTestService.getRecentTestResults(1, 5);
          recentResults = testResults;
        } catch (error) {
          console.error('Failed to fetch recent test results:', error);
        }

        // Fetch recent prescriptions with error handling
        let recentPrescriptions: { data: Prescription[]; total: number } = { data: [], total: 0 };
        try {
          const prescriptions = await prescriptionService.getPrescriptions(1, 5);
          recentPrescriptions = prescriptions;
        } catch (error) {
          console.error('Failed to fetch recent prescriptions:', error);
        }

        setStats({
          totalPatients: patientData.total || 0,
          recentPatients: patientData.data || [],
          pendingExaminations: pendingExams.total || 0,
          completedExaminations: completedExams.total || 0,
          pendingTests: pendingTests.total || 0,
          completedTests: completedTests.total || 0,
          recentExaminations: recentExams.data || [],
          pendingLabTests: (pendingTests.data || []).slice(0, 5),
          recentTestResults: recentResults.data || [],
          recentPrescriptions: recentPrescriptions.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStats({
          totalPatients: 0,
          recentPatients: [],
          pendingExaminations: 0,
          completedExaminations: 0,
          pendingTests: 0,
          completedTests: 0,
          recentExaminations: [],
          pendingLabTests: [],
          recentTestResults: [],
          recentPrescriptions: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Welcome Message */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Welcome, !</h2>
        <p className="text-gray-600">
          Today is {formatDateToLocale(new Date())}. Here's an overview of your
          medical lab.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Patients
          </h3>
          <p className="text-2xl font-bold">{stats.totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Pending Examinations
          </h3>
          <p className="text-2xl font-bold">{stats.pendingExaminations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Pending Lab Tests
          </h3>
          <p className="text-2xl font-bold">{stats.pendingTests}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Completed Tests
          </h3>
          <p className="text-2xl font-bold">{stats.completedTests}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Patients</h2>
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={() => router.push("/patients")}
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/patients/${patient.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {patient.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateToLocale(patient.createdAt)}
                    </td>
                  </tr>
                ))}
                {stats.recentPatients.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Examinations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Examinations</h2>
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={() => router.push("/examinations")}
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
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
                {stats.recentExaminations.map((exam) => (
                  <tr
                    key={exam.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/examinations/${exam.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {exam.patient?.name || "Unknown Patient"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateToLocale(exam.examDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          exam.status === ExamStatus.COMPLETED
                            ? "bg-green-100 text-green-800"
                            : exam.status === ExamStatus.IN_PROGRESS
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentExaminations.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No examinations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Lab Tests */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Pending Lab Tests</h2>
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => router.push("/lab-tests")}
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.pendingLabTests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {test.testName || "Unknown Test"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {test.patientName || "Unknown Patient"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateToLocale(test.assignedDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        test.status === TestStatus.COMPLETED
                          ? "bg-green-100 text-green-800"
                          : test.status === TestStatus.IN_PROGRESS
                          ? "bg-yellow-100 text-yellow-800"
                          : test.status === TestStatus.CANCELLED
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {test.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.pendingLabTests.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No pending lab tests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Test Results */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Test Results</h2>
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => router.push("/test-results")}
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
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
              {(stats.recentTestResults || []).map((result) => (
                <tr
                  key={result.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/test-results/${result.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      Test #{result.assignedTestId}
                    </div>
                    {result.technician && (
                      <div className="text-sm text-gray-500">
                        by {result.technician.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.resultData}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateToLocale(result.resultDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.status === ResultStatus.REVIEWED
                          ? "bg-green-100 text-green-800"
                          : result.status === ResultStatus.SUBMITTED
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {result.status}
                    </span>
                    {result.comment && (
                      <div className="text-xs text-gray-500 mt-1">
                        {result.comment}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!stats.recentTestResults?.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No recent test results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Prescriptions and Conclusions */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Prescriptions & Conclusions</h2>
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => router.push("/prescriptions")}
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentPrescriptions.map((prescription) => (
                <tr
                  key={prescription.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {/* {prescription.examination?.patient?.name || `Patient #${prescription.examinationId}`} */}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md overflow-hidden">
                      {prescription.diagnosis.length > 100
                        ? `${prescription.diagnosis.substring(0, 100)}...`
                        : prescription.diagnosis}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {prescription.items?.length || 0} medications
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateToLocale(prescription.createdAt)}
                  </td>
                </tr>
              ))}
              {stats.recentPrescriptions.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No recent prescriptions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
