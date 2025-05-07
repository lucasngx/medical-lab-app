// src/components/lab-tests/LabTestList.tsx

"use client";

import { useState } from "react";
import { LabTest } from "@/types";
import { Info, Search } from "lucide-react";

interface LabTestListProps {
  tests: LabTest[];
  onSelect?: (testId: number) => void;
}

export default function LabTestList({ tests, onSelect }: LabTestListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDetails, setViewDetails] = useState<number | null>(null);

  const filteredTests = searchQuery
    ? tests.filter(
        (test) =>
          test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tests;

  const toggleDetails = (id: number) => {
    setViewDetails(viewDetails === id ? null : id);
  };

  if (tests.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No lab tests found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Test Name
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Unit
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Reference Range
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredTests.map((test) => (
              <>
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {test.name}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell">
                    {test.unit}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:table-cell">
                    {test.refRange.min} - {test.refRange.max} {test.unit}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => toggleDetails(test.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View details"
                      >
                        <Info size={18} />
                      </button>
                      {onSelect && (
                        <button
                          onClick={() => onSelect(test.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {viewDetails === test.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        <h4 className="font-medium mb-1">Description:</h4>
                        <p className="mb-3">{test.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Unit:</h4>
                            <p>{test.unit}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">
                              Reference Range:
                            </h4>
                            <p>
                              {test.refRange.min} - {test.refRange.max}{" "}
                              {test.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
