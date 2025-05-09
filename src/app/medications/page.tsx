"use client";

import MedicationList from "@/components/medications/MedicationList";

export default function MedicationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Medications</h1>
        <p className="text-gray-600 mt-1">Manage medication records</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <MedicationList />
      </div>
    </div>
  );
}
