// src/components/lab-tests/AssignedTestList.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AssignedTest, TestStatus, ResultStatus } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { File, FileCheck, XCircle, Loader2, Pencil, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import api from "@/services/api";

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
  const [historicalResults, setHistoricalResults] = useState<{ [key: number]: AssignedTest[] }>({});

  const filteredTests = filterOption
    ? tests.filter((test) => test.status === filterOption)
    : tests;

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!historicalResults[id]) {
        try {
          const currentTest = tests.find((t) => t.id === id);
          if (currentTest && currentTest.labTestId) {
            const response = await api.get<{data: AssignedTest[]}>(`/assigned-tests?labTestId=${currentTest.labTestId}&status=COMPLETED`);
            setHistoricalResults((prev) => ({
              ...prev,
              [id]: response.data.filter((t: AssignedTest) => t.id !== id).slice(0, 3),
            }));
          }
        } catch (error) {
          console.error("Failed to fetch historical results:", error);
        }
      }
    }
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

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case TestStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case TestStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case TestStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const compareWithRange = (value: string, test: AssignedTest) => {
    if (!test.labTest?.refRange || !value) return null;
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return null;

    if (numericValue < test.labTest.refRange.min) return "below";
    if (numericValue > test.labTest.refRange.max) return "above";
    return "normal";
  };

  const getTrendIndicator = (currentTest: AssignedTest, historicalTests: AssignedTest[]) => {
    if (!currentTest.result || historicalTests.length === 0) return null;

    const currentValue = parseFloat(currentTest.result.resultData);
    if (isNaN(currentValue)) return null;

    const latestHistorical = historicalTests[0];
    if (!latestHistorical.result) return null;

    const previousValue = parseFloat(latestHistorical.result.resultData);
    if (isNaN(previousValue)) return null;

    const difference = currentValue - previousValue;
    if (Math.abs(difference) < 0.001) return "stable";
    return difference > 0 ? "increasing" : "decreasing";
  };

  const getTrendColor = (trend: string | null) => {
    switch (trend) {
      case "increasing":
        return "text-red-500";
      case "decreasing":
        return "text-green-500";
      case "stable":
        return "text-blue-500";
      default:
        return "text-gray-500";
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
              Patient
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
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <button
                      onClick={() => toggleExpand(test.id)}
                      className="mr-2 text-gray-500 hover:text-gray-700 mt-1"
                    >
                      {expandedId === test.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {test.labTest?.name || test.testName || `Test #${test.labTestId}`}
                      </div>
                      {test.labTest && (
                        <div className="text-sm text-gray-500 mt-1">
                          {test.labTest.description}
                          {test.labTest.unit && (
                            <div className="mt-1">
                              <span className="inline-block mr-3">Unit: {test.labTest.unit}</span>
                              {test.labTest.refRange && (
                                <span>
                                  Range: {test.labTest.refRange.min} - {test.labTest.refRange.max}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.patientName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{test.examinationId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateToLocale(test.assignedDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      test.status
                    )}`}
                  >
                    {test.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {test.status !== TestStatus.CANCELLED &&
                      test.status !== TestStatus.COMPLETED &&
                      onEnterResults && (
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
              {expandedId === test.id && (
                <tr className="bg-gray-50">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {test.result ? (
                        <>
                          <h4 className="font-medium mb-2">Current Result:</h4>
                          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 mb-4">
                            <div>
                              <dt className="font-medium text-gray-500">Value:</dt>
                              <dd className="flex items-center">
                                {test.result.resultData}
                                {historicalResults[test.id]?.length > 0 && (
                                  <span
                                    className={`ml-2 ${getTrendColor(
                                      getTrendIndicator(test, historicalResults[test.id])
                                    )}`}
                                  >
                                    <TrendingUp size={16} />
                                  </span>
                                )}
                              </dd>
                              {test.labTest?.refRange && (
                                <dd
                                  className={`text-xs mt-1 ${
                                    compareWithRange(test.result.resultData, test) === "normal"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {compareWithRange(test.result.resultData, test) === "normal"
                                    ? "Within range"
                                    : compareWithRange(test.result.resultData, test) === "above"
                                    ? "Above range"
                                    : "Below range"}
                                </dd>
                              )}
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
                              <div className="sm:col-span-3">
                                <dt className="font-medium text-gray-500">Comments:</dt>
                                <dd>{test.result.comment}</dd>
                              </div>
                            )}
                          </dl>

                          {historicalResults[test.id]?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Previous Results:</h4>
                              <div className="space-y-3">
                                {historicalResults[test.id].map(
                                  (historicalTest) =>
                                    historicalTest.result && (
                                      <div
                                        key={historicalTest.id}
                                        className="p-3 bg-white rounded border border-gray-200"
                                      >
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                          <div>
                                            <span className="text-gray-500">Value: </span>
                                            <span className="font-medium">
                                              {historicalTest.result.resultData}
                                            </span>
                                            {historicalTest.labTest?.refRange && (
                                              <div
                                                className={`text-xs mt-1 ${
                                                  compareWithRange(
                                                    historicalTest.result.resultData,
                                                    historicalTest
                                                  ) === "normal"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }`}
                                              >
                                                {compareWithRange(
                                                  historicalTest.result.resultData,
                                                  historicalTest
                                                ) === "normal"
                                                  ? "Within range"
                                                  : compareWithRange(
                                                      historicalTest.result.resultData,
                                                      historicalTest
                                                    ) === "above"
                                                  ? "Above range"
                                                  : "Below range"}
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Date: </span>
                                            <span className="font-medium">
                                              {formatDateToLocale(historicalTest.result.resultDate)}
                                            </span>
                                          </div>
                                          <div>
                                            <button
                                              onClick={() => handleViewResults(historicalTest)}
                                              className="text-blue-600 hover:text-blue-900 text-sm"
                                            >
                                              View Details
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p>No results available yet</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {filteredTests.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                No tests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
