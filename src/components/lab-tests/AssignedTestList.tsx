// src/components/lab-tests/AssignedTestList.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AssignedTest, TestStatus, ResultStatus } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { File, FileCheck, XCircle, Loader2, Pencil } from "lucide-react";

interface AssignedTestListProps {
  tests: AssignedTest[];
  onEnterResults?: (testId: number) => void;
  onCancelTest?: (testId: number) => void;
  filterOption?: TestStatus;
}

export default function AssignedTestList({
  tests,
  onEnterResults,
  onCancelTest,
  filterOption,
}: AssignedTestListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredTests = filterOption
    ? tests.filter((test) => test.status === filterOption)
    : tests;

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleViewResults = (test: AssignedTest) => {
    if (test.result) {
      router.push(`/test-results/${test.result.id}`);
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case TestStatus.PENDING:
        return <File size={18} className="text-gray-500" />;
      case TestStatus.IN_PROGRESS:
        return <Loader2 size={18} className="text-yellow-500" />;
      case TestStatus.COMPLETED:
        return <FileCheck size={18} className="text-green-500" />;
      case TestStatus.CANCELLED:
        return <XCircle size={18} className="text-red-500" />;
      default:
        return <File size={18} className="text-gray-500" />;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Test Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Examination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTests.map((test) => (
            <React.Fragment key={test.id}>
              <tr
                className={`hover:bg-gray-50 ${
                  expandedId === test.id ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleExpand(test.id)}
                      className="mr-2 text-gray-500 hover:text-gray-700"
                    >
                      {expandedId === test.id ? "−" : "+"}
                    </button>
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                      {getStatusIcon(test.status)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {test.labTest?.name || `Test #${test.labTestId}`}
                      </div>
                      {test.labTest && (
                        <div className="text-sm text-gray-500">
                          {test.labTest.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{test.examinationId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateToLocale(test.assignedDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      test.status === TestStatus.COMPLETED
                        ? "bg-green-100 text-green-800"
                        : test.status === TestStatus.IN_PROGRESS
                        ? "bg-yellow-100 text-yellow-800"
                        : test.status === TestStatus.CANCELLED
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {test.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {test.status !== TestStatus.CANCELLED &&
                      test.status !== TestStatus.COMPLETED && onEnterResults && (
                        <button
                          onClick={() => onEnterResults(test.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Enter results"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                    {test.status !== TestStatus.CANCELLED &&
                      test.status !== TestStatus.COMPLETED &&
                      onCancelTest && (
                        <button
                          onClick={() => onCancelTest(test.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel test"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    {test.status === TestStatus.COMPLETED && test.result && (
                      <button
                        onClick={() => handleViewResults(test)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View results"
                      >
                        <FileCheck size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              {expandedId === test.id && test.result && (
                <tr className="bg-gray-50">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      <h4 className="font-medium mb-2">Result Details:</h4>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <dt className="font-medium text-gray-500">Value:</dt>
                          <dd>{test.result.resultData}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-500">Date:</dt>
                          <dd>{formatDateToLocale(test.result.resultDate)}</dd>
                        </div>
                        {test.result.technician && (
                          <div>
                            <dt className="font-medium text-gray-500">Technician:</dt>
                            <dd>{test.result.technician.name}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="font-medium text-gray-500">Status:</dt>
                          <dd>{test.result.status}</dd>
                        </div>
                        {test.result.comment && (
                          <div className="sm:col-span-2">
                            <dt className="font-medium text-gray-500">Comments:</dt>
                            <dd>{test.result.comment}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {filteredTests.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No tests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
