"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TestResult, ResultStatus, Role } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { usePagination } from "@/hooks/usePagination";
import api from "@/services/api";
import { mockAssignedTests } from "@/utils/mockData";
import labTestService from "@/services/labTestService";

// Generate test results from assigned tests
const mockTestResults: TestResult[] = mockAssignedTests.map((test, index) => ({
  id: index + 1,
  assignedTestId: test.id,
  technicianId: index % 2 + 1,
  resultData: test.labTest?.name === "Blood Glucose Test" ? "120 mg/dL" :
             test.labTest?.name === "Lipid Panel" ? "180 mg/dL" : 
             "Normal",
  resultDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
  status: Object.values(ResultStatus)[Math.floor(Math.random() * 3)],
  comment: test.labTest?.name === "Blood Glucose Test" ? "Slightly elevated, within acceptable range" :
          test.labTest?.name === "Lipid Panel" ? "Cholesterol levels normal" :
          "No abnormalities detected",
  technician: {
    id: index % 2 + 1,
    name: index % 2 === 0 ? "John Smith" : "Sarah Johnson",
    department: index % 2 === 0 ? "Laboratory" : "Hematology",
    phone: index % 2 === 0 ? "123-456-7890" : "123-456-7891",
    email: index % 2 === 0 ? "john.smith@lab.com" : "sarah.johnson@lab.com",
    role: Role.TECHNICIAN,
  },
}));

const TestResultsPage = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ResultStatus | "">("");
  const router = useRouter();

  const pagination = usePagination({
    totalItems: totalResults,
    initialPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const fetchTestResults = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        };
        if (statusFilter) {
          params.status = statusFilter;
        }

        const response = await labTestService.getRecentTestResults(1, 100);

        console.log("Fetched test results:", response);
        setTestResults(response.data);
        setTotalResults(response.total);
      } catch (error) {
        console.error("Failed to fetch test results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestResults();
  }, [pagination.currentPage, pagination.itemsPerPage, statusFilter]);

  const getStatusColor = (status: ResultStatus) => {
    switch (status) {
      case ResultStatus.REVIEWED:
        return "bg-green-100 text-green-800";
      case ResultStatus.SUBMITTED:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
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
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
        
        <div className="mt-3 sm:mt-0 sm:flex sm:items-center sm:space-x-4">
          <div className="w-48">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ResultStatus | "")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              {Object.values(ResultStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <Link
            href="/test-results/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Test Result
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {testResults && testResults.map((result) => (
            <li
              key={result.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/test-results/${result.id}`)}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      Test #{result.assignedTestId}
                    </p>
                    <span
                      className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {result.status}
                    </span>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">
                      {formatDateToLocale(result.resultDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Result: {result.resultData}
                    </p>
                    {result.technician && (
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        Technician: {result.technician.name}
                      </p>
                    )}
                  </div>
                </div>
                {result.comment && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Comment: {result.comment}
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalResults > pagination.itemsPerPage && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.prevPage()}
              disabled={pagination.currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.currentPage > 1
                  ? "text-gray-700 bg-white hover:bg-gray-50"
                  : "text-gray-300 bg-gray-50 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => pagination.nextPage()}
              disabled={pagination.currentPage >= pagination.totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.currentPage < pagination.totalPages
                  ? "text-gray-700 bg-white hover:bg-gray-50"
                  : "text-gray-300 bg-gray-50 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    totalResults
                  )}
                </span>{" "}
                of <span className="font-medium">{totalResults}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => pagination.goToPage(1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage > 1
                      ? "text-gray-500 hover:bg-gray-50"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  First
                </button>
                <button
                  onClick={() => pagination.prevPage()}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage > 1
                      ? "text-gray-500 hover:bg-gray-50"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => pagination.nextPage()}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage < pagination.totalPages
                      ? "text-gray-500 hover:bg-gray-50"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={() => pagination.goToPage(pagination.totalPages)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage < pagination.totalPages
                      ? "text-gray-500 hover:bg-gray-50"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  Last
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultsPage;