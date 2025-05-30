"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { TestResult, ResultStatus } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { usePagination } from "@/hooks/usePagination";
import testResultService from "@/services/testResultService";

interface TestResultWithDetails extends TestResult {
  assignedTest?: {
    labTest?: {
      name: string;
    };
    examination?: {
      patient?: {
        name: string;
      };
    };
  };
}

export default function TestResultsPage() {
  const [testResults, setTestResults] = useState<TestResultWithDetails[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ResultStatus | "">("");
  const [searchTerm, setSearchTerm] = useState("");
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
        let results: TestResultWithDetails[] = [];
        let total = 0;

        if (statusFilter) {
          const response = await testResultService.getTestResultsByStatus(statusFilter);
          results = response;
          total = response.length;
        } else {
          const response = await testResultService.getTestResults(
            pagination.currentPage - 1,
            pagination.itemsPerPage
          );
          results = response.data;
          total = response.total;
        }

        setTestResults(results);
        setTotalResults(total);
      } catch (error) {
        console.error("Failed to fetch test results:", error);
        setTestResults([]);
        setTotalResults(0);
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

  const filteredResults = (testResults || []).filter((result) => {
    if (!result) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    const technicianName = result.technician?.name?.toLowerCase() || '';
    const resultData = result.resultData?.toLowerCase() || '';
    const comment = result.comment?.toLowerCase() || '';

    return (
      technicianName.includes(searchTermLower) ||
      resultData.includes(searchTermLower) ||
      comment.includes(searchTermLower)
    );
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
        <p className="text-gray-600 mt-1">
          View and manage laboratory test results
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:flex sm:items-center sm:justify-between border-b">
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ResultStatus | "")}
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              {Object.values(ResultStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => router.push("/test-results/new")}
            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Test Result
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Test Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Patient
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Technician
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr
                  key={result.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/test-results/${result.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600">
                      {result.assignedTest?.labTest?.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDateToLocale(result.resultDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {result.assignedTest?.examination?.patient?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {result.technician?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/test-results/${result.id}/edit`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.prevPage()}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.nextPage()}
              disabled={pagination.currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                  onClick={() => pagination.prevPage()}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => pagination.nextPage()}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
