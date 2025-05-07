"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Examination, ExamStatus } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { usePagination } from "@/hooks/usePagination";
import api from "@/services/api";
import { mockExaminations } from "@/utils/mockData";

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
        if (process.env.NODE_ENV === 'development') {
          // Use mock data in development
          const filteredExams = statusFilter
            ? mockExaminations.filter(exam => exam.status === statusFilter)
            : mockExaminations;
          
          const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
          const end = start + pagination.itemsPerPage;
          const paginatedExams = filteredExams.slice(start, end);
          
          setExaminations(paginatedExams);
          setTotalExams(filteredExams.length);
          setIsLoading(false);
          return;
        }

        const params: Record<string, string | number> = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        };
        if (statusFilter) {
          params.status = statusFilter;
        }

        const response = await api.get<{ data: Examination[]; total: number }>(
          "/examinations",
          params
        );
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
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
        <div className="mt-4 sm:mt-0 sm:flex sm:items-center sm:space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExamStatus | "")}
            className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            {Object.values(ExamStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={() => router.push("/examinations/new")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Examination
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {examinations.map((examination) => (
            <li
              key={examination.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/examinations/${examination.id}`)}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-blue-600">
                      Examination #{examination.id}
                    </div>
                    <span
                      className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        examination.status
                      )}`}
                    >
                      {examination.status}
                    </span>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">
                      {formatDateToLocale(examination.examDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Patient: {examination.patient?.name || examination.patientId}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Doctor: {examination.doctor?.name || examination.doctorId}
                    </p>
                  </div>
                </div>
                {examination.symptoms && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Symptoms: {examination.symptoms}
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {totalExams > pagination.itemsPerPage && (
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

export default ExaminationsPage;
