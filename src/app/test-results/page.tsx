"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { TestResult, ResultStatus } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { usePagination } from "@/hooks/usePagination";
import labTestService from "@/services/labTestService";

export default function TestResultsPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
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
        const params: Record<string, string | number> = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        };
        if (statusFilter) {
          params.status = statusFilter;
        }

        const response = await labTestService.getRecentTestResults(1, 100);

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

  const filteredResults = testResults.filter((result) =>
    result.technician?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.resultData.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <p className="text-gray-600 mt-1">View and manage laboratory test results</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ResultStatus | "")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr
                  key={result.id}
                  onClick={() => router.push(`/test-results/${result.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">Test #{result.assignedTestId}</div>
                    {result.comment && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{result.comment}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{result.resultData}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{result.technician?.name}</div>
                    <div className="text-sm text-gray-500">{result.technician?.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateToLocale(result.resultDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalResults > pagination.itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
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
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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
    </div>
  );
}