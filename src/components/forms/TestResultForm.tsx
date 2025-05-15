// src/components/forms/TestResultForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, AlertCircle } from "lucide-react";
import { TestResult, ResultStatus, AssignedTest, TestStatus, Technician } from "@/types";
import api from "@/services/api";
import labTestService from "@/services/labTestService";
import technicianService from "@/services/technicianService";

interface TestResultFormProps {
  assignedTestId?: number;
  resultId?: number;
  onSuccess?: () => void;
}

export default function TestResultForm({
  assignedTestId,
  resultId,
  onSuccess,
}: TestResultFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableTests, setAvailableTests] = useState<AssignedTest[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTest, setSelectedTest] = useState<AssignedTest | null>(null);
  const [formData, setFormData] = useState<Partial<TestResult>>({
    resultData: "",
    resultDate: new Date().toISOString().split("T")[0],
    status: ResultStatus.DRAFT,
    comment: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [testsResponse, techniciansResponse] = await Promise.all([
          labTestService.getAssignedTests(1, 100, TestStatus.PENDING),
          technicianService.getTechnicians(1, 100)
        ]);
        
        setAvailableTests(testsResponse.data || []);
        setTechnicians(techniciansResponse.data || []);
        
        if (assignedTestId) {
          const test = testsResponse.data?.find(t => t.id === assignedTestId);
          if (test) {
            setSelectedTest(test);
            setFormData(prev => ({ ...prev, assignedTestId }));
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load required data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [assignedTestId]);

  // useEffect(() => {
  //   if (resultId) {
  //     setIsLoading(true);
  //     api.get<TestResult>(`/test-results/${resultId}`)
  //       .then((result) => {
  //         setFormData({
  //           ...result,
  //           resultDate: result.resultDate.split("T")[0],
  //         });
  //       })
  //       .catch((err) => {
  //         setError("Failed to load test result");
  //         console.error(err);
  //       })
  //       .finally(() => {
  //         setIsLoading(false);
  //       });
  //   }
  // }, [resultId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const testId = Number(e.target.value);
    const test = availableTests.find(t => t.id === testId);
    setSelectedTest(test || null);
    setFormData(prev => ({
      ...prev,
      assignedTestId: testId || undefined,
      resultData: "", // Reset result data when changing tests
    }));
  };

  const isValueOutOfRange = () => {
    if (!selectedTest?.labTest?.refRange || !formData.resultData) return false;
    const numericResult = parseFloat(formData.resultData);
    return (
      !isNaN(numericResult) &&
      (numericResult < selectedTest.labTest.refRange.min ||
        numericResult > selectedTest.labTest.refRange.max)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assignedTestId) {
      setError("Please select a test");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        resultDate: new Date(formData.resultDate || new Date()).toISOString(),
         assignedTest: { id: Number(formData.assignedTestId) },
        technician: { id: Number(formData.technicianId) },
      };


      if (resultId) {
        await api.put(`/test-results/${resultId}`, payload);
      } else {
        await api.post("/test-results", payload);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/test-results");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save test result";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !selectedTest && !formData.assignedTestId) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {!assignedTestId && (
        <div>
          <label htmlFor="assignedTestId" className="block text-sm font-medium text-gray-700 mb-1">
            Select Test *
          </label>
          <div className="relative">
            <select
              id="assignedTestId"
              name="assignedTestId"
              required
              value={formData.assignedTestId || ""}
              onChange={handleTestSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="">Select a test...</option>
              {availableTests.map((test) => (
                <option key={test.id} value={test.id}>
                {`${test.testName || `Test #${test.labTestId}`} - ${test.patientName || 'Unknown'} - ${test.status} - ${new Date(test.assignedDate).toLocaleDateString()}`}
              </option>              
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
          {availableTests.length === 0 && !isLoading && (
            <p className="mt-2 text-sm text-gray-500">No pending tests available</p>
          )}
        </div>
      )}

      {selectedTest?.labTest && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800">Test Information</h3>
          <dl className="mt-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-blue-600">Test Name:</dt>
              <dd className="text-blue-900">{selectedTest.labTest.name}</dd>
            </div>
            <div className="flex justify-between mt-1">
              <dt className="text-blue-600">Unit:</dt>
              <dd className="text-blue-900">{selectedTest.labTest.unit}</dd>
            </div>
            <div className="flex justify-between mt-1">
              <dt className="text-blue-600">Reference Range:</dt>
              <dd className="text-blue-900">
                {selectedTest.labTest.refRange.min} - {selectedTest.labTest.refRange.max} {selectedTest.labTest.unit}
              </dd>
            </div>
            {selectedTest.patientName && (
              <div className="flex justify-between mt-1">
                <dt className="text-blue-600">Patient:</dt>
                <dd className="text-blue-900">{selectedTest.patientName}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="technicianId" className="block text-sm font-medium text-gray-700 mb-1">
            Technician *
          </label>
          <div className="relative">
            <select
              id="technicianId"
              name="technicianId"
              required
              value={formData.technicianId || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Select a technician...</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name} - {technician.department}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="resultDate" className="block text-sm font-medium text-gray-700 mb-1">
            Result Date *
          </label>
          <input
            type="date"
            id="resultDate"
            name="resultDate"
            required
            value={formData.resultDate || ""}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <div className="relative">
            <select
              id="status"
              name="status"
              required
              value={formData.status || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value={ResultStatus.DRAFT}>Draft</option>
              <option value={ResultStatus.SUBMITTED}>Submit for Review</option>
              {formData.status === ResultStatus.REVIEWED && (
                <option value={ResultStatus.REVIEWED}>Reviewed</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="resultData" className="block text-sm font-medium text-gray-700 mb-1">
            Result Value *
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="resultData"
              name="resultData"
              required
              value={formData.resultData || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isValueOutOfRange() ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              placeholder={`Enter value in ${selectedTest?.labTest?.unit || 'specified units'}`}
            />
            {selectedTest?.labTest?.unit && (
              <span className="text-sm text-gray-500">{selectedTest.labTest.unit}</span>
            )}
          </div>
          {isValueOutOfRange() && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Value is outside the reference range
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comments
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            value={formData.comment || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional comments about the test result..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : resultId ? "Update Result" : "Save Result"}
        </button>
      </div>
    </form>
  );
}
