"use client";

import PatientList from "@/components/patients/PatientList";

export default function PatientsPage() {

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="text-gray-600 mt-1">Manage patient records</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <PatientList />
      </div>
    </div>
  );
}
