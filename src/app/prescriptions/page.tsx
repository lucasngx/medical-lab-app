"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Prescription, Examination } from "@/types";
import { usePagination } from "@/hooks/usePagination";
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
        const response = await api.get<{ data: Prescription[]; total: number }>(
          "/prescriptions",
          {
            page: 1,
            limit: 100,
          }
        );
        console.log("Fetched 1:", response.data);

        // For each prescription, fetch associated examination details
        const prescriptionsWithDetails = await Promise.all(
          response.data.map(async (prescription) => {
            if (prescription.examinationId) {
              const examinationResponse = await api.get<Examination>(
                `/examinations/${prescription.examinationId}`
              );
              return {
                ...prescription,                patient: examinationResponse.patient,
                doctor: examinationResponse.doctor,
              };
            }
            return prescription;
          })
        );

        console.log("Fetched prescriptions:", prescriptionsWithDetails);

        setPrescriptions(prescriptionsWithDetails);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-600 mt-1">Manage patient prescriptions</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:flex sm:items-center sm:justify-between border-b">
          <div className="flex-1"></div>
          <button
            onClick={() => router.push("/prescriptions/new")}
            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Prescription
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prescriptions.map((prescription) => (
                <tr
                  key={prescription.id}
                  className="hover:bg-gray-50"
                  onClick={() => router.push(`/prescriptions/${prescription.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {prescription.patient?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {prescription.doctor?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {prescription.doctor?.specialization}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {prescription.diagnosis}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/prescriptions/${prescription.id}/edit`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(prescription.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {prescriptions.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">No prescriptions found</p>
          </div>
        )}

        {totalPrescriptions > pagination.itemsPerPage && (
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

export default PrescriptionsPage;