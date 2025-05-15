"use client";

import LabTestForm from "@/components/forms/LabTestForm";

export default function NewLabTestPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Create New Lab Test
        </h1>
        <LabTestForm />
      </div>
    </div>
  );
}
