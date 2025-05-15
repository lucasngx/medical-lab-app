"use client";

import { useEffect, useState } from "react";
import { LabTest } from "@/types";
import labTestService from "@/services/labTestService";
import LabTestForm from "@/components/forms/LabTestForm";

export default function EditLabTestPage({ params }: { params: { id: string } }) {
  const [labTest, setLabTest] = useState<LabTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLabTest = async () => {
      try {
        setIsLoading(true);
        const data = await labTestService.getLabTestById(parseInt(params.id));
        setLabTest(data);
      } catch (err) {
        console.error("Error fetching lab test:", err);
        setError("Failed to load lab test");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabTest();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !labTest) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Lab test not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Edit Lab Test
        </h1>
        <LabTestForm initialData={labTest} />
      </div>
    </div>
  );
}
