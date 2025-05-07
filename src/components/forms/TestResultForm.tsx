// src/components/forms/TestResultForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { TestResult, ResultStatus, AssignedTest, LabTest } from "@/types";
import api from "@/services/api";

interface TestResultFormProps {
  assignedTestId: number;
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
  const [assignedTest, setAssignedTest] = useState<AssignedTest & { labTest?: LabTest }>();
  const [formData, setFormData] = useState<Partial<TestResult>>({
    assignedTestId,
    resultData: "",
    resultDate: new Date().toISOString().split("T")[0],
    status: ResultStatus.DRAFT,
    comment: "",
  });

  const isEditing = !!resultId;

  useEffect(() => {
    const fetchAssignedTest = async () => {
      setIsLoading(true);
      try {
        const data = await api.get(`/assigned-tests/${assignedTestId}`);
        setAssignedTest(data as AssignedTest & { labTest?: LabTest });
      } catch (err) {
        console.error("Error fetching assigned test:", err);
        setError("Failed to load test details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedTest();
  }, [assignedTestId]);

  useEffect(() => {
    if (resultId) {
      setIsLoading(true);
      api
        .get<TestResult>(`/test-results/${resultId}`)
        .then((result) => {
          setFormData({
            ...result,
            resultDate: result.resultDate.split("T")[0],
          });
        })
        .catch((err) => {
          setError("Failed to load test result");
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [resultId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValueOutOfRange = () => {
    if (!assignedTest?.labTest?.refRange || !formData.resultData) return false;
    const numericResult = parseFloat(formData.resultData);
    return (
      !isNaN(numericResult) &&
      (numericResult < assignedTest.labTest.refRange.min ||
        numericResult > assignedTest.labTest.refRange.max)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        resultDate: new Date(formData.resultDate || new Date()).toISOString(),
      };

      if (isEditing && resultId) {
        await api.put(`/test-results/${resultId}`, payload);
      } else {
        await api.post("/test-results", payload);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/lab-tests/${assignedTestId}/results`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save test result";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !assignedTest) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {assignedTest && assignedTest.labTest && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800">Test Information</h3>
          <dl className="mt-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-blue-600">Test Name:</dt>
              <dd className="text-blue-900">{assignedTest.labTest.name}</dd>
            </div>
            {assignedTest.labTest.unit && (
              <div className="flex justify-between mt-1">
                <dt className="text-blue-600">Unit:</dt>
                <dd className="text-blue-900">{assignedTest.labTest.unit}</dd>
              </div>
            )}
            {assignedTest.labTest.refRange && (
              <div className="flex justify-between mt-1">
                <dt className="text-blue-600">Reference Range:</dt>
                <dd className="text-blue-900">
                  {assignedTest.labTest.refRange.min} - {assignedTest.labTest.refRange.max} {assignedTest.labTest.unit}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder={`Enter value in ${assignedTest?.labTest?.unit || 'specified units'}`}
            />
            {assignedTest?.labTest?.unit && (
              <span className="text-sm text-gray-500">{assignedTest.labTest.unit}</span>
            )}
          </div>
          {isValueOutOfRange() && (
            <p className="mt-1 text-sm text-red-600">
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

      <div className="flex justify-end space-x-3">
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
          {isLoading ? "Saving..." : isEditing ? "Update Result" : "Save Result"}
        </button>
      </div>
    </form>
  );
}
