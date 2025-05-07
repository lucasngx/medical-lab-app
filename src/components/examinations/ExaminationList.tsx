// src/components/examinations/ExaminationList.tsx

"use client";

import { useState } from "react";
import { Examination, ExamStatus } from "@/types";
import { formatDateToLocale } from "@/utils/dateUtils";
import { Pencil, Trash2, ClipboardList, Eye } from "lucide-react";

interface ExaminationListProps {
  examinations: Examination[];
  onView?: (examinationId: number) => void;
  onEdit?: (examinationId: number) => void;
  onDelete?: (examinationId: number) => void;
}

export default function ExaminationList({
  examinations,
  onView,
  onEdit,
  onDelete,
}: ExaminationListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (examinations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No examinations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID / Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doctor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Exam Date
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
          {examinations.map((exam) => (
            <tr
              key={exam.id}
              className={`hover:bg-gray-50 ${
                expandedId === exam.id ? "bg-blue-50" : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleExpand(exam.id)}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    {expandedId === exam.id ? "−" : "+"}
                  </button>
                  <div>
                    <div className="font-medium text-gray-900">#{exam.id}</div>
                    <div className="text-sm text-gray-500">
                      {exam.patient?.name || `Patient ${exam.patientId}`}
                    </div>
                  </div>
                </div>
                {expandedId === exam.id && (
                  <div className="mt-3 ml-6 text-sm text-gray-500">
                    <p className="mb-1">
                      <span className="font-semibold">Symptoms:</span>{" "}
                      {exam.symptoms.length > 100
                        ? `${exam.symptoms.substring(0, 100)}...`
                        : exam.symptoms}
                    </p>
                    {exam.notes && (
                      <p>
                        <span className="font-semibold">Notes:</span>{" "}
                        {exam.notes.length > 100
                          ? `${exam.notes.substring(0, 100)}...`
                          : exam.notes}
                      </p>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exam.doctor?.name || `Doctor ${exam.doctorId}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateToLocale(exam.examDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${
                    exam.status === ExamStatus.COMPLETED
                      ? "bg-green-100 text-green-800"
                      : exam.status === ExamStatus.IN_PROGRESS
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {exam.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex">
                {onView && (
                  <button
                    onClick={() => onView(exam.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View details"
                  >
                    <Eye size={18} />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(exam.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit examination"
                  >
                    <Pencil size={18} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(exam.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete examination"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
