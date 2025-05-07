"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Patient } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import api from "@/services/api";
import { mockPatients } from "@/utils/mockData";

const PatientsPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const pagination = usePagination({
    totalItems: totalPatients,
    initialPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        if (process.env.NODE_ENV === 'development') {
          // Use mock data in development
          const filteredPatients = searchTerm
            ? mockPatients.filter(patient => 
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone.includes(searchTerm)
              )
            : mockPatients;
          
          const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
          const end = start + pagination.itemsPerPage;
          const paginatedPatients = filteredPatients.slice(start, end);
          
          setPatients(paginatedPatients);
          setTotalPatients(filteredPatients.length);
          setIsLoading(false);
          return;
        }

        const params: Record<string, string | number> = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        };
        if (searchTerm) {
          params.search = searchTerm;
        }

        const response = await api.get<{ data: Patient[]; total: number }>(
          "/patients",
          params
        );
        setPatients(response.data);
        setTotalPatients(response.total);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm]);

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
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <div className="mt-4 sm:mt-0 sm:flex sm:items-center sm:space-x-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={() => router.push("/patients/new")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Patient
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <li
              key={patient.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/patients/${patient.id}`)}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-blue-600">
                      {patient.name}
                    </div>
                    <div className="ml-2 text-sm text-gray-500">
                      (DOB: {new Date(patient.dob).toLocaleDateString()})
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">
                      ID: #{patient.id}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Phone: {patient.phone}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Email: {patient.email}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Address: {patient.address}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {totalPatients > pagination.itemsPerPage && (
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

export default PatientsPage;
