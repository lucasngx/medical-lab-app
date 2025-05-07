"use client";

import { useRouter } from "next/navigation";
import PrescriptionForm from "@/components/forms/PrescriptionForm";

const NewPrescriptionPage = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Prescription</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new prescription for a patient examination
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <PrescriptionForm
            onSuccess={() => router.push("/prescriptions")}
          />
        </div>
      </div>
    </div>
  );
};

export default NewPrescriptionPage;