"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LabTest } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import api from "@/services/api";
import AssignTestModal from "@/components/examinations/AssignTestModal";

const LabTestsPage = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [totalTests, setTotalTests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
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

  const handleAssignTest = async (labTestId: number, examinationId: number) => {
    try {
      await api.post("/assigned-tests", {
        examinationId,
        labTestId,
      });
    } catch (error) {
      console.error("Failed to assign tests:", error);
    }
    setShowAssignModal(false);
    setSelectedTestId(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lab Tests</h1>
        <p className="text-gray-600 mt-1">Manage laboratory test catalog</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:flex sm:items-center sm:justify-between border-b">
          <div className="flex-1"></div>
          <button
            onClick={() => router.push("/lab-tests/new")}
            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add New Test
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit & Range
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {labTests && labTests.map((test) => (
                <tr 
                  key={test.id} 
                  className="hover:bg-gray-50"
                >
                  <td 
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => router.push(`/lab-tests/${test.id}`)}
                  >
                    <div className="text-sm font-medium text-blue-600">
                      {test.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Test #{test.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {test.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Unit: {test.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      Range: {test.refRange.min} - {test.refRange.max}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedTestId(test.id);
                        setShowAssignModal(true);
                      }}
                      className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                    >
                      Assign to Patient
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {labTests.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">No lab tests found</p>
          </div>
        )}

        {totalTests > pagination.itemsPerPage && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => pagination.prevPage()}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => pagination.nextPage()}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAssignModal && selectedTestId && (
        <AssignTestModal
          preSelectedTestIds={[selectedTestId]}
          onAssign={handleAssignTest}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedTestId(null);
          }}
        />
      )}
    </div>
  );
};

export default LabTestsPage;
