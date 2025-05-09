"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Medication } from '@/types';
import { PenSquare, Trash2, Search } from 'lucide-react';
import medicationService from '@/services/medicationService';
import { usePagination } from '@/hooks/usePagination';

export default function MedicationList() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  const { currentPage, totalPages, itemsPerPage, nextPage, prevPage } = usePagination({
    totalItems,
    itemsPerPage: 10
  });

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setIsLoading(true);
        const response = await medicationService.getMedications(currentPage, itemsPerPage);
        setMedications(response.data);
        setTotalItems(response.total);
      } catch (err) {
        setError("Failed to load medications");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedications();
  }, [currentPage, itemsPerPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this medication?")) {
      return;
    }

    try {
      await medicationService.deleteMedication(id);
      setMedications(medications.filter(med => med.id !== id));
     
    } catch (err) {
      setError("Failed to delete medication");
      console.error(err);
     
    }
  };

  const filteredMedications = medications && medications.filter(medication =>
    medication.name.toLowerCase().includes(searchTerm.toLowerCase())
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

      <div className="mb-4 flex items-center justify-between">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search medications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => router.push('/medications/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          Add New Medication
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosage Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Side Effects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedications && filteredMedications.map((medication) => (
                <tr key={medication.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {medication.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">
                      {medication.dosageInfo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">
                      {medication.sideEffects}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push(`/medications/${medication.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PenSquare className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(medication.id)}
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

        {filteredMedications && filteredMedications.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500">No medications found</p>
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
    </div>
  );
}
