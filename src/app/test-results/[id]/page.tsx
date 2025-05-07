"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TestResult, AssignedTest, LabTest, TestStatus, Role, ResultStatus } from "@/types";
import TestResultForm from "@/components/forms/TestResultForm";
import api from "@/services/api";

const mockLabTest: LabTest = {
  id: 1,
  name: "Blood Glucose Test",
  description: "Measures the amount of glucose in the blood",
  unit: "mg/dL",
  refRange: {
    min: 70,
    max: 140
  }
};

const mockAssignedTest: AssignedTest = {
  id: 101,
  examinationId: 1,
  labTestId: 1,
  status: TestStatus.COMPLETED,
  assignedDate: "2025-04-25T10:00:00Z",
  labTest: mockLabTest
};

const mockTestResult: TestResult = {
  id: 1,
  assignedTestId: 101,
  technicianId: 1,
  resultData: "120",
  resultDate: "2025-04-25T10:30:00Z",
  status: ResultStatus.SUBMITTED,
  comment: "Normal glucose levels",
  technician: {
    id: 1,
    name: "John Smith",
    department: "Laboratory",
    phone: "123-456-7890",
    email: "john.smith@lab.com",
    role: Role.TECHNICIAN
  }
};

export default function TestResultDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTestResult = async () => {
      setIsLoading(true);
      try {
        if (process.env.NODE_ENV === 'development') {
          // Use mock data in development
          setTestResult(mockTestResult);
          setIsLoading(false);
          return;
        }

        const data = await api.get<TestResult>(`/test-results/${params.id}`);
        setTestResult(data);
      } catch (err) {
        console.error("Error fetching test result:", err);
        setError("Failed to load test result");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestResult();
  }, [params.id]);

  const handleSuccess = () => {
    router.push("/test-results");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !testResult) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Test result not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Test Result</h1>
      <TestResultForm
        assignedTestId={testResult.assignedTestId}
        resultId={testResult.id}
        onSuccess={handleSuccess}
      />
    </div>
  );
}