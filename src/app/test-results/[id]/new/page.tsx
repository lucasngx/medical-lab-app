"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Examination, AssignedTest, TestStatus } from "@/types";
import TestResultForm from "@/components/forms/TestResultForm";
import examinationService from "@/services/examinationService";
import assignedTestService from "@/services/assignedTestService";

export default function NewTestResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [assignedTest, setAssignedTest] = useState<AssignedTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // First try to fetch as an examination ID
        try {
          const examData = await examinationService.getExaminationById(parseInt(id));
          setExamination(examData);
          
          // Fetch assigned tests for this examination
          const tests = await assignedTestService.getAssignedTestsByExamination(parseInt(id));
          const pendingTests = tests.filter(test => test.status === TestStatus.PENDING);
          
          if (pendingTests.length === 0) {
            setError("No pending tests available for this examination");
          } else {
            setAssignedTest(pendingTests[0]); // Use the first pending test
          }
        } catch (examErr) {
          // If not an examination, try as an assigned test ID
          try {
            const test = await assignedTestService.getById(parseInt(id));
            if (test.status !== TestStatus.PENDING) {
              setError("This test is not available for results entry");
              return;
            }
            setAssignedTest(test);
            
            // Fetch examination details
            if (test.examinationId) {
              const examData = await examinationService.getExaminationById(test.examinationId);
              setExamination(examData);
            }
          } catch (testErr) {
            setError("Invalid ID provided");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  if (error || (!examination && !assignedTest)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enter Test Result</h1>
      <TestResultForm
        examinationId={examination?.id}
        assignedTestId={assignedTest?.id}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 