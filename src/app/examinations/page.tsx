"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Examination, ExamStatus } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { usePagination } from "@/hooks/usePagination";
import examinationService from "@/services/examinationService";

const ExaminationsPage = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [totalExams, setTotalExams] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ExamStatus | "">("");
  const router = useRouter();

  const pagination = usePagination({
    totalItems: totalExams,
    initialPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const fetchExaminations = async () => {
      setIsLoading(true);
      try {
        let response;

        if (statusFilter) {
          // Use status-specific service method
          response = await examinationService.getExaminationsByStatus(
            statusFilter,
            pagination.currentPage - 1, // Convert to 0-based
            pagination.itemsPerPage
          );
        } else {
          // Use general examinations service method
          response = await examinationService.getExaminations(
            pagination.currentPage - 1, // Convert to 0-based
            pagination.itemsPerPage
          );
        }

        setExaminations(response.data);
        setTotalExams(response.total);
      } catch (error) {
        console.error("Failed to fetch examinations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExaminations();
  }, [pagination.currentPage, pagination.itemsPerPage, statusFilter]);

  const getStatusColor = (status: ExamStatus) => {
    switch (status) {
      case ExamStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case ExamStatus.IN_PROGRESS:
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
        <p className="text-gray-600 mt-1">Manage medical examinations</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:flex sm:items-center sm:justify-between border-b">
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ExamStatus | "")
              }
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              {Object.values(ExamStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => router.push("/examinations/new")}
            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Examination
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
                  Exam Info
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
                  Doctor
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
              {examinations.map((examination) => (
                <tr
                  key={examination.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/examinations/${examination.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-blue-600">
                      Examination #{examination.id}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDateToLocale(examination.examDate)}
                    </div>
                    {examination.symptoms && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {examination.symptoms}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {examination.patient?.name || examination.patientId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {examination.doctor?.name || examination.doctorId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        examination.status
                      )}`}
                    >
                      {examination.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {examinations.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">No examinations found</p>
          </div>
        )}

        {totalExams > pagination.itemsPerPage && (
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
    </div>
  );
};

export default ExaminationsPage;
