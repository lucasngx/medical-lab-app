"use client";

import DoctorList from "@/components/doctors/DoctorList";

export default function DoctorsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <p className="text-gray-600 mt-1">Manage doctor records</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DoctorList />
      </div>
    </div>
  );
}
