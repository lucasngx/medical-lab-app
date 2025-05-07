import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import ExaminationFormWrapper from "@/components/examinations/ExaminationFormWrapper";

export const metadata: Metadata = {
  title: "Create New Examination | Medical Lab",
  description: "Create a new patient examination record",
};

export default function NewExamination() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/examinations"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Examinations</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Create New Examination
        </h1>

        {/* Using client component wrapper */}
        <ExaminationFormWrapper />
      </div>
    </div>
  );
}
