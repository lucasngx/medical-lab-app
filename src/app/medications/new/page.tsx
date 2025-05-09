"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MedicationForm from "@/components/medications/MedicationForm";

export default function NewMedicationPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <Link href="/medications" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Medications</span>
        </Link>
        <h1 className="text-2xl font-bold">Add New Medication</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <MedicationForm onSuccess={() => router.push("/medications")} />
      </div>
    </div>
  );
}
