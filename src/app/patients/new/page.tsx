"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import PatientForm from "@/components/forms/PatientForm";

export default function NewPatientPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Patient</h1>
        <p className="text-gray-600 mt-1">Create a new patient record</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <PatientForm onSuccess={() => router.push("/patients")} />
      </div>
    </div>
  );
}
