"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Technician } from '@/types';
import technicianService from '@/services/technicianService';
import { Phone, Mail, PenSquare, Trash2 } from 'lucide-react';

export default function TechnicianList() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await technicianService.getTechnicians(1, 10);
        console.log(response);
        setTechnicians(response.data);
      } catch (err) {
        setError("Failed to load technicians");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {technicians && technicians.map((technician) => (
              <tr key={technician.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {technician.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {technician.department}
                  </div>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => router.push(`/technicians/${technician.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PenSquare className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(technician.id)}
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

      {technicians && technicians.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500">No technicians found</p>
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
        </div>
        <div className="space-x-2">
          <button
            onClick={() => router.push('/technicians/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Technician
          </button>
        </div>
      </div>
    </div>
  );
}