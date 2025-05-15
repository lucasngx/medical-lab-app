"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Technician } from '@/types';
import { Phone, Mail, PenSquare, Trash2, Search } from 'lucide-react';
import technicianService from '@/services/technicianService';
import { usePagination } from '@/hooks/usePagination';

export default function TechnicianList() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);

  const { currentPage, totalPages, itemsPerPage, nextPage, prevPage } = usePagination({
    totalItems,
    itemsPerPage: 10
  });

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setIsLoading(true);
        const response = await technicianService.getTechnicians(currentPage, itemsPerPage);
        setTechnicians(response.data);
        setTotalItems(response.total);
      } catch (err) {
        setError("Failed to load technicians");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTechnicians();
  }, [currentPage, itemsPerPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this technician?")) {
      return;
    }

    try {
      await technicianService.deleteTechnician(id);
      setTechnicians(technicians.filter(tech => tech.id !== id));
    } catch (err) {
      setError("Failed to delete technician");
      console.error(err);
    }
  };

  const filteredTechnicians = technicians.filter(technician =>
    technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    technician.department.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search technicians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => router.push('/technicians/new')}
          className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add New Technician
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTechnicians.map((technician) => (
              <tr 
                key={technician.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/technicians/${technician.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">{technician.name}</div>
                  <div className="text-sm text-gray-500">ID: #{technician.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{technician.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {technician.phone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {technician.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/technicians/${technician.id}/edit`);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PenSquare className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(technician.id);
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

      {filteredTechnicians.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500">No technicians found</p>
        </div>
      )}

      {totalItems > itemsPerPage && (
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