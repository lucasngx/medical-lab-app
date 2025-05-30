"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Examination, AssignedTest, TestStatus, ExamStatus } from "@/types";
import { Search, Calendar, User, Stethoscope, ChevronLeft, ChevronRight } from "lucide-react";
import examinationService from "@/services/examinationService";
import assignedTestService from "@/services/assignedTestService";
import TestResultForm from "@/components/forms/TestResultForm";

export default function NewTestResultPage() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedExamination, setSelectedExamination] = useState<Examination | null>(null);
  const [assignedTests, setAssignedTests] = useState<AssignedTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchExaminations = async () => {
      try {
        const response = await examinationService.getExaminations(currentPage);
        setExaminations(response.data || []);
        setTotalPages(Math.ceil((response.total || 0) / (response.limit || 10)));
        setTotalItems(response.total || 0);
      } catch (error) {
        console.error("Failed to fetch examinations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExaminations();
  }, [currentPage]);

  useEffect(() => {
    const fetchAssignedTests = async () => {
      if (!selectedExamination) return;

      try {
        const response = await assignedTestService.getAssignedTestsByExamination(
          selectedExamination.id
        );
        // Handle both array and paginated response formats
        const tests = Array.isArray(response) ? response : (response as { data: AssignedTest[] }).data || [];
        setAssignedTests(tests.filter((test: AssignedTest) => test.status === TestStatus.PENDING));
      } catch (error) {
        console.error("Failed to fetch assigned tests:", error);
        setAssignedTests([]);
      }
    };

    fetchAssignedTests();
  }, [selectedExamination]);

  const filteredExaminations = examinations.filter(exam => 
    (exam.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.id.toString().includes(searchTerm) ||
    exam.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    // Only show examinations that are not cancelled or completed
    exam.status !== ExamStatus.CANCELLED &&
    exam.status !== ExamStatus.COMPLETED
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Test Result</h1>
        <p className="text-gray-600 mt-1">
          Create a new test result for an examination
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by patient name, examination ID, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto border border-gray-200 rounded-md">
              {filteredExaminations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No valid examinations found
                </div>
              ) : (
                filteredExaminations.map((exam) => (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamination(exam)}
                    className={`p-4 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                      selectedExamination?.id === exam.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            Examination #{exam.id}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {new Date(exam.examDate).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            exam.status === ExamStatus.SCHEDULED ? 'bg-yellow-100 text-yellow-800' :
                            exam.status === ExamStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {exam.status}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          {exam.patient && (
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-1" />
                              {exam.patient.name}
                            </div>
                          )}
                          {exam.doctor && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Stethoscope className="h-4 w-4 mr-1" />
                              Dr. {exam.doctor.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExamination(exam);
                          }}
                          className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
                            selectedExamination?.id === exam.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {filteredExaminations.length} of {totalItems} examinations
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {selectedExamination && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-3">
                  Selected Examination Details
                </h3>
                <dl className="space-y-2">
                  <div className="flex justify-between items-center">
                    <dt className="text-blue-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Date:
                    </dt>
                    <dd className="text-blue-900">
                      {new Date(selectedExamination.examDate).toLocaleDateString()}
                    </dd>
                  </div>
                  {selectedExamination.patient && (
                    <div className="flex justify-between items-center">
                      <dt className="text-blue-600 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Patient:
                      </dt>
                      <dd className="text-blue-900">
                        {selectedExamination.patient.name}
                      </dd>
                    </div>
                  )}
                  {selectedExamination.doctor && (
                    <div className="flex justify-between items-center">
                      <dt className="text-blue-600 flex items-center">
                        <Stethoscope className="h-4 w-4 mr-1" />
                        Doctor:
                      </dt>
                      <dd className="text-blue-900">
                        Dr. {selectedExamination.doctor.name}
                      </dd>
                    </div>
                  )}
                  {selectedExamination.symptoms && (
                    <div className="flex justify-between items-start">
                      <dt className="text-blue-600 flex items-start">
                        <Stethoscope className="h-4 w-4 mr-1 mt-1" />
                        Symptoms:
                      </dt>
                      <dd className="text-blue-900 text-right">
                        {selectedExamination.symptoms}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {selectedExamination && assignedTests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Available Tests
              </h3>
              {assignedTests.map((test) => (
                <div
                  key={test.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => router.push(`/test-results/${test.id}/new`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{test.labTest?.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Assigned: {new Date(test.assignedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/test-results/${test.id}/new`);
                      }}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                    >
                      Enter Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedExamination && assignedTests.length === 0 && (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No pending tests available for this examination
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}