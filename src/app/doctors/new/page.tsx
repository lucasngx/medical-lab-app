"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import DoctorForm from "@/components/forms/DoctorForm";

export default function NewDoctorPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <Link href="/doctors" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Doctors</span>
        </Link>
        <h1 className="text-2xl font-bold">Add New Doctor</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        <DoctorForm onSuccess={() => router.push("/doctors")} />
      </div>
    </div>
  );
}
