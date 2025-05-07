// src/components/lab-tests/TestResultEntry.tsx

"use client";

import { useState } from 'react';
import { TestResult, AssignedTest, ResultStatus } from '../../types';

interface TestResultEntryProps {
  assignedTest: AssignedTest;
  onSubmit: (result: Partial<TestResult>) => Promise<void>;
  initialData?: TestResult;
}

export default function TestResultEntry({ assignedTest, onSubmit, initialData }: TestResultEntryProps) {
  const [resultData, setResultData] = useState(initialData?.resultData || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [status, setStatus] = useState<ResultStatus>(initialData?.status || ResultStatus.DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        assignedTestId: assignedTest.id,
        resultData,
        comment,
        status,
        resultDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to submit test result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValueOutOfRange = () => {
    if (!assignedTest.labTest?.refRange || !resultData) return false;
    const numericResult = parseFloat(resultData);
    return (
      !isNaN(numericResult) &&
      (numericResult < assignedTest.labTest.refRange.min ||
        numericResult > assignedTest.labTest.refRange.max)
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Test: {assignedTest.labTest?.name}
        </label>
        <div className="mt-1">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={resultData}
              onChange={(e) => setResultData(e.target.value)}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                ${isValueOutOfRange() ? 'border-red-300 bg-red-50' : ''}`}
              placeholder={`Enter value in ${assignedTest.labTest?.unit || 'specified units'}`}
              required
            />
            <span className="text-sm text-gray-500">{assignedTest.labTest?.unit}</span>
          </div>
          {assignedTest.labTest?.refRange && (
            <p className="mt-1 text-sm text-gray-500">
              Reference Range: {assignedTest.labTest.refRange.min} - {assignedTest.labTest.refRange.max}{' '}
              {assignedTest.labTest.unit}
            </p>
          )}
          {isValueOutOfRange() && (
            <p className="mt-1 text-sm text-red-600">
              Value is outside the reference range
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comments
        </label>
        <div className="mt-1">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Add any relevant comments or observations"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ResultStatus)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value={ResultStatus.DRAFT}>Draft</option>
          <option value={ResultStatus.SUBMITTED}>Submit for Review</option>
          {initialData?.status === ResultStatus.REVIEWED && (
            <option value={ResultStatus.REVIEWED}>Reviewed</option>
          )}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Saving...' : 'Save Results'}
        </button>
      </div>
    </form>
  );
}
