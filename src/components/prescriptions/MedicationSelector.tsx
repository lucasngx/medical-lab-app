// src/components/prescriptions/MedicationSelector.tsx

"use client";

import { useState, useEffect } from "react";
import { Medication } from "@/types";
import prescriptionService from "@/services/prescriptionService";
import { Search, Plus } from "lucide-react";

interface MedicationSelectorProps {
  onSelect: (medication: Medication) => void;
  excludeIds?: number[];
}

export default function MedicationSelector({
  onSelect,
  excludeIds = [],
}: MedicationSelectorProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMedications = async () => {
      try {
        const response = await prescriptionService.getMedications(1, 100);
        setMedications(response.data);
        setFilteredMedications(
          response.data.filter((med) => !excludeIds.includes(med.id))
        );
      } catch (error) {
        console.error("Failed to load medications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMedications();
  }, [excludeIds]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Reset to full list if search is empty
      setFilteredMedications(
        medications.filter((med) => !excludeIds.includes(med.id))
      );
      return;
    }

    try {
      setIsLoading(true);
      const results = await prescriptionService.searchMedications(
        searchTerm.trim(),
        20
      );
      setFilteredMedications(
        results.filter((med) => !excludeIds.includes(med.id))
      );
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle key press to search on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Select Medication
        </h3>
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search medications..."
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-60">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-2 text-sm text-gray-500">Loading medications...</p>
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {searchTerm ? (
              <p>No medications found for "{searchTerm}"</p>
            ) : (
              <p>No medications available</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredMedications.map((medication) => (
              <li
                key={medication.id}
                className="py-3 flex items-start hover:bg-gray-50 rounded-md px-2 cursor-pointer"
                onClick={() => onSelect(medication)}
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus size={16} className="text-blue-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {medication.name}
                  </p>
                  <div className="mt-1 flex justify-between">
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {medication.dosageInfo}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
