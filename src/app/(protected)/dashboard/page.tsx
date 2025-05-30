"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import patientService from "@/services/patientService";
import examinationService from "@/services/examinationService";
import labTestService from "@/services/labTestService";
import prescriptionService from "@/services/prescriptionService";
import assignedTestService from "@/services/assignedTestService";
import testResultService from "@/services/testResultService";
import { formatDateToLocale } from "@/utils/dateUtils";
import {
  ExamStatus,
  TestStatus,
  Patient,
  Examination,
  TestResult,
  Prescription,
  LabTest,
  ResultStatus,
} from "@/types";
import {
  UserPlus,
  FileText,
  Beaker,
  Clipboard,
  ExternalLink,
} from "lucide-react";

interface DashboardStats {
  totalPatients: number;
  recentPatients: Patient[];
  pendingExaminations: number;
  completedExaminations: number;
  pendingTests: number;
  completedTests: number;
  recentExaminations: Examination[];
  pendingLabTests: LabTest[];
  recentTestResults: TestResult[];
  recentPrescriptions: Prescription[];
}

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push("/login");
      return;
    }
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all patients
        const patients = await patientService.getPatients(0, 10);
        
        // Fetch all examinations
        const examinations = await examinationService.getExaminations(0, 10);

        // Fetch all lab tests
        const labTests = await labTestService.getLabTests(0, 10);

        // Fetch all test results
        const testResults = await testResultService.getTestResults(0, 10);

        // Fetch all prescriptions
        const prescriptions = await prescriptionService.getPrescriptions(0, 10);

        setDashboardStats({
          totalPatients: patients.total || 0,
          recentPatients: patients.data || [],
          pendingExaminations: examinations.data.filter(exam => exam.status === ExamStatus.SCHEDULED).length,
          completedExaminations: examinations.data.filter(exam => exam.status === ExamStatus.COMPLETED).length,
          pendingTests: labTests.data.filter(test => test.status === TestStatus.PENDING).length,
          completedTests: labTests.data.filter(test => test.status === TestStatus.COMPLETED).length,
          recentExaminations: examinations.data || [],
          pendingLabTests: labTests.data.filter(test => test.status === TestStatus.PENDING) || [],
          recentTestResults: testResults.data || [],
          recentPrescriptions: prescriptions.data || [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          {/* Quick Actions */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() => router.push("/patients/new")}
                className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                New Patient
              </button>
              <button
                onClick={() => router.push("/examinations/new")}
                className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FileText className="h-5 w-5 mr-2" />
                New Examination
              </button>
              <button
                onClick={() => router.push("/lab-tests")}
                className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Beaker className="h-5 w-5 mr-2" />
                Lab Tests
              </button>
              <button
                onClick={() => router.push("/prescriptions/new")}
                className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Clipboard className="h-5 w-5 mr-2" />
                New Prescription
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Patients
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.totalPatients}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Examinations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.pendingExaminations}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Lab Tests
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.pendingTests}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Tests
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.completedTests}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Recent Patients */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recent Patients
                    </h3>
                    <Link
                      href="/patients"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View All <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {dashboardStats.recentPatients.map((patient) => (
                      <Link
                        key={patient.id}
                        href={`/patients/${patient.id}`}
                        className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateToLocale(patient.dateOfBirth)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Examinations */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recent Examinations
                    </h3>
                    <Link
                      href="/examinations"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View All <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {dashboardStats.recentExaminations.map((exam) => (
                      <Link
                        key={exam.id}
                        href={`/examinations/${exam.id}`}
                        className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {exam.patient?.name || "Unknown Patient"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateToLocale(exam.examDate)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Test Results */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recent Test Results
                    </h3>
                    <Link
                      href="/test-results"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View All <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {dashboardStats.recentTestResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/test-results/${result.id}`}
                        className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Beaker className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {result.test?.name || "Unknown Test"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateToLocale(result.resultDate)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div className="bg-white shadow rounded-lg col-span-1 sm:col-span-2 lg:col-span-3 mt-5">
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recent Prescriptions
                    </h3>
                    <Link
                      href="/prescriptions"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View All <ExternalLink className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardStats.recentPrescriptions.map((prescription) => (
                      <Link
                        key={prescription.id}
                        href={`/prescriptions/${prescription.id}`}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
                      >
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Clipboard className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {prescription.patient?.name || "Unknown Patient"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateToLocale(prescription.createdAt)}
                          </div>
                          <div className="text-xs text-gray-400">
                            By Dr. {prescription.doctor?.name || "Unknown"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
