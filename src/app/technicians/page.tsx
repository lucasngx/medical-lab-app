"use client";

import TechnicianList from '@/components/technicians/TechnicianList';

export default function TechniciansPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Technicians</h1>
      </div>
      <TechnicianList />
    </div>
  );
}