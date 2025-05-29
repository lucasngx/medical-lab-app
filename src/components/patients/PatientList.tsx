// src/components/patients/PatientList.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Patient } from "@/types";
import {
  Search,
  PenSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import patientService from "@/services/patientService";
import { usePagination } from "@/hooks/usePagination";

export default function PatientList() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  const { currentPage, totalPages, itemsPerPage, nextPage, prevPage } =
    usePagination({
      totalItems,
      itemsPerPage: 10,
    });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        console.log(
          "Fetching patients with page:",
          currentPage - 1,
          "size:",
          itemsPerPage
        );
        const response = await patientService.getPatients(
          currentPage - 1,
          itemsPerPage
        );
        console.log("Patients response:", response);
        setPatients(response.data || []);
        setTotalItems(response.total || 0);
      } catch (err) {
        setError("Failed to load patients");
        console.error("Patient fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      await patientService.deletePatient(id);
      setPatients(patients.filter((patient) => patient.id !== id));
    } catch (err) {
      setError("Failed to delete patient");
      console.error(err);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="p-4 sm:flex sm:items-center sm:justify-between border-b">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => router.push("/patients/new")}
          className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Patient
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
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                DOB
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Address
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {patient.name}
                  </div>
                  <div className="text-sm text-gray-500">ID: #{patient.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(patient.dob).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{patient.phone}</div>
                  <div className="text-sm text-gray-500">{patient.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{patient.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => router.push(`/patients/${patient.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PenSquare className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(patient.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPatients.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {patients.length === 0
              ? "No patients found in database"
              : `No patients match your search "${searchTerm}"`}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Total items: {totalItems}, Current page: {currentPage}, Items per
            page: {itemsPerPage}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
