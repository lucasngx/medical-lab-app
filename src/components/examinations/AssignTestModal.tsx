// src/components/examinations/AssignTestModal.tsx

"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LabTest } from "@/types";
import api from "@/services/api";
import labTestService from "@/services/labTestService";

interface AssignTestModalProps {
  examinationId: number;
  onAssign: (labTestIds: number[]) => void;
  onClose?: () => void;
}

export default function AssignTestModal({
  examinationId,
  onAssign,
  onClose,
}: AssignTestModalProps) {
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const tests = await labTestService.getLabTests(1, 100);
        setAvailableTests(tests.data);
      } catch (err) {
        console.error("Failed to fetch lab tests:", err);
        setError("Failed to load available tests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleTestToggle = (testId: number) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleAssign = () => {
    onAssign(selectedTests);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Assign Lab Tests</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-grow overflow-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    id={`test-${test.id}`}
                    checked={selectedTests.includes(test.id)}
                    onChange={() => handleTestToggle(test.id)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`test-${test.id}`}
                    className="flex-grow cursor-pointer"
                  >
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-gray-500">
                      {test.description}
                    </div>
                    {test.unit && (
                      <div className="text-sm text-gray-500">
                        Unit: {test.unit}
                      </div>
                    )}
                    {test.refRange && (
                      <div className="text-sm text-gray-500">
                        Reference Range: {test.refRange.min} - {test.refRange.max}
                      </div>
                    )}
                  </label>
                </div>
              ))}

              {availableTests.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No lab tests available
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedTests.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Assign Selected Tests
          </button>
        </div>
      </div>
    </div>
  );
}
