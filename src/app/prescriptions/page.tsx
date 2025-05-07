"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Prescription } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import { mockPrescriptions } from "@/utils/mockData";
import PrescriptionList from "@/components/prescriptions/PrescriptionList";
import api from "@/services/api";

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [totalPrescriptions, setTotalPrescriptions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const pagination = usePagination({
    totalItems: totalPrescriptions,
    initialPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoading(true);
      try {
        if (process.env.NODE_ENV === 'development') {
          // Use mock data in development
          const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
          const end = start + pagination.itemsPerPage;
          const paginatedPrescriptions = mockPrescriptions.slice(start, end);
          
          setPrescriptions(paginatedPrescriptions);
          setTotalPrescriptions(mockPrescriptions.length);
          setIsLoading(false);
          return;
        }

        const response = await api.get<{ data: Prescription[]; total: number }>(
          "/prescriptions",
          {
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
          }
        );
        setPrescriptions(response.data);
        setTotalPrescriptions(response.total);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        setPrescriptions(prev => prev.filter(p => p.id !== id));
        setTotalPrescriptions(prev => prev - 1);
        return;
      }

      await api.delete(`/prescriptions/${id}`);
      setPrescriptions(prev => prev.filter(p => p.id !== id));
      setTotalPrescriptions(prev => prev - 1);
    } catch (error) {
      console.error("Failed to delete prescription:", error);
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
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => router.push("/prescriptions/new")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Prescription
          </button>
        </div>
      </div>

      <PrescriptionList
        prescriptions={prescriptions}
        onView={(id) => router.push(`/prescriptions/${id}`)}
        onEdit={(id) => router.push(`/prescriptions/${id}/edit`)}
        onDelete={handleDelete}
      />

      {totalPrescriptions > pagination.itemsPerPage && (
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

export default PrescriptionsPage;