"use client";

import TechnicianList from '@/components/technicians/TechnicianList';

export default function TechniciansPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
        <p className="text-gray-600 mt-1">Manage lab technician records</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TechnicianList />
      </div>
    </div>
  );
}