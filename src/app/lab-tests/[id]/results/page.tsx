"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TestResultEntry } from "@/components/lab-tests/TestResultEntry";
import { AssignedTest, LabTest, TestResult, TestStatus } from "@/types";
import api from "@/services/api";

// Mock data for development
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
  status: TestStatus.IN_PROGRESS,
  assignedDate: "2025-04-25T10:00:00Z",
  labTest: mockLabTest
};

export default function TestResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assignedTest, setAssignedTest] = useState<AssignedTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignedTest = async () => {
      setIsLoading(true);
      try {
        if (process.env.NODE_ENV === 'development') {
          // Use mock data in development
          setAssignedTest(mockAssignedTest);
          setIsLoading(false);
          return;
        }

        const data = await api.get<AssignedTest>(`/assigned-tests/${params.id}`);
        setAssignedTest(data);
      } catch (err) {
        console.error("Error fetching assigned test:", err);
        setError("Failed to load test details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedTest();
  }, [params.id]);

  const handleSubmitResult = async (result: Partial<TestResult>) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock successful submission in development
        console.log('Submitting result:', result);
        router.push('/test-results');
        return;
      }

      await api.post('/test-results', result);
      router.push('/test-results');
    } catch (err) {
      console.error('Error submitting test result:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !assignedTest) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Test not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enter Test Result</h1>
      <TestResultEntry
        assignedTest={assignedTest}
        onSubmit={handleSubmitResult}
      />
    </div>
  );
}
