"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LabTest } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import api from "@/services/api";
import { mockLabTests } from "@/utils/mockData";

const LabTestsPage = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [totalTests, setTotalTests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const pagination = usePagination({
    totalItems: totalTests,
    initialPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const fetchLabTests = async () => {
      setIsLoading(true);
      try {
        if (process.env.NODE_ENV === 'development') {
          // Use mock data in development
          const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
          const end = start + pagination.itemsPerPage;
          const paginatedTests = mockLabTests.slice(start, end);
          
          setLabTests(paginatedTests);
          setTotalTests(mockLabTests.length);
          setIsLoading(false);
          return;
        }

        const response = await api.get<{ data: LabTest[]; total: number }>(
          "/lab-tests",
          {
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
          }
        );
        setLabTests(response.data);
        setTotalTests(response.total);
      } catch (error) {
        console.error("Failed to fetch lab tests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabTests();
  }, [pagination.currentPage, pagination.itemsPerPage]);

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
        <h1 className="text-2xl font-bold text-gray-900">Lab Tests</h1>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => router.push("/lab-tests/new")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add New Test
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {labTests.map((test) => (
            <li
              key={test.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/lab-tests/${test.id}`)}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-blue-600">
                      {test.name}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">
                    {test.description}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Unit: {test.unit} | Reference Range: {test.refRange.min} - {test.refRange.max}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalTests > pagination.itemsPerPage && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => pagination.prevPage()}
            disabled={pagination.currentPage === 1}
            className={`px-3 py-1 border rounded ${
              pagination.currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-1">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.nextPage()}
            disabled={pagination.currentPage >= pagination.totalPages}
            className={`px-3 py-1 border rounded ${
              pagination.currentPage >= pagination.totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LabTestsPage;
