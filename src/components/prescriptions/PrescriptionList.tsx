// src/components/prescriptions/PrescriptionList.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prescription } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { FileText, Eye, Pencil, Trash2 } from "lucide-react";

interface PrescriptionListProps {
  prescriptions: Prescription[];
  onView?: (prescriptionId: number) => void;
  onEdit?: (prescriptionId: number) => void;
  onDelete?: (prescriptionId: number) => void;
}

export default function PrescriptionList({
  prescriptions,
  onView,
  onEdit,
  onDelete,
}: PrescriptionListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleView = (id: number) => {
    if (onView) {
      onView(id);
    } else {
      router.push(`/prescriptions/${id}`);
    }
  };

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No prescriptions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID / Examination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Medications
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prescriptions.map((prescription) => (
            <tr
              key={prescription.id}
              className={`hover:bg-gray-50 ${
                expandedId === prescription.id ? "bg-blue-50" : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleExpand(prescription.id)}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    {expandedId === prescription.id ? "−" : "+"}
                  </button>
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FileText size={18} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      Prescription #{prescription.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      For Exam #{prescription.examinationId}
                    </div>
                  </div>
                </div>

                {expandedId === prescription.id && (
                  <div className="mt-3 ml-12 text-sm text-gray-500">
                    <p className="mb-1">
                      <span className="font-semibold">Diagnosis:</span>{" "}
                      {prescription.diagnosis.length > 100
                        ? `${prescription.diagnosis.substring(0, 100)}...`
                        : prescription.diagnosis}
                    </p>
                    {prescription.notes && (
                      <p>
                        <span className="font-semibold">Notes:</span>{" "}
                        {prescription.notes.length > 100
                          ? `${prescription.notes.substring(0, 100)}...`
                          : prescription.notes}
                      </p>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateToLocale(prescription.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {prescription.items ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {prescription.items.length} medications
                  </span>
                ) : (
                  <span className="text-gray-400">Unknown</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleView(prescription.id)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="View prescription"
                  >
                    <Eye size={18} />
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(prescription.id)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Edit prescription"
                    >
                      <Pencil size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(prescription.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete prescription"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
