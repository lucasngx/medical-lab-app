// src/components/prescriptions/PrescriptionDetails.tsx

"use client";

import { useState, useEffect } from "react";
import { formatDateToLocale } from "@/utils/dateUtils";
import { Prescription, PrescriptionItem } from "@/types";
import prescriptionService from "@/services/prescriptionService";
import { FileText, Download, Printer } from "lucide-react";

interface PrescriptionDetailsProps {
  prescription: Prescription;
  showActions?: boolean;
}

export default function PrescriptionDetails({
  prescription,
  showActions = true,
}: PrescriptionDetailsProps) {
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPrescriptionItems = async () => {
      if (!prescription || !prescription.id) return;

      setIsLoading(true);
      try {
        if (prescription.items) {
          setItems(prescription.items);
        } else {
          const itemsData = await prescriptionService.getPrescriptionItems(
            prescription.id
          );
          setItems(itemsData);
        }
      } catch (error) {
        console.error("Failed to load prescription items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrescriptionItems();
  }, [prescription]);

  const handleExport = async (format: "pdf" | "csv" = "pdf") => {
    if (!prescription || !prescription.id) return;

    try {
      const blob = await prescriptionService.exportPrescription(
        prescription.id,
        format
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `prescription_${prescription.id}.${format}`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Failed to export prescription as ${format}:`, error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No prescription data available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {/* Prescription Header */}
      <div className="bg-blue-50 px-6 py-4 border-b flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-blue-900">
              Prescription #{prescription.id}
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created on: {formatDateToLocale(prescription.createdAt)}
          </p>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Printer className="h-4 w-4 mr-2" /> Print
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Patient and Examination Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4 border-b">
        <div>
          <h3 className="text-xs font-medium uppercase text-gray-500">
            For Examination
          </h3>
          <p className="mt-1 text-sm font-medium">
            #{prescription.examinationId}
          </p>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="px-6 py-4 border-b">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Diagnosis</h3>
        <p className="whitespace-pre-wrap text-gray-900">
          {prescription.diagnosis}
        </p>
      </div>

      {/* Medications */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Prescribed Medications
        </h3>

        {items.length === 0 ? (
          <p className="text-gray-500 italic">
            No medications added to this prescription.
          </p>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Medication
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dosage
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Frequency
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-gray-900">
                            {item.medication?.name ||
                              `Medication #${item.medicationId}`}
                          </div>
                          {item.medication && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.medication.dosageInfo?.substring(0, 50)}
                              {item.medication.dosageInfo?.length > 50
                                ? "..."
                                : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dosage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.duration || "Not specified"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes */}
      {prescription.notes && (
        <div className="px-6 py-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </h3>
          <p className="whitespace-pre-wrap text-gray-900">
            {prescription.notes}
          </p>
        </div>
      )}

      {/* Print-friendly footer */}
      <div className="px-6 py-4 border-t text-xs text-gray-500 hidden print:block">
        <p>
          Prescription #{prescription.id} issued on{" "}
          {formatDateToLocale(prescription.createdAt)}
        </p>
      </div>
    </div>
  );
}
