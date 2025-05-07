// src/components/examinations/ExaminationDetails.tsx

"use client";

import { formatDateToLocale } from "@/utils/dateUtils";
import { Examination, ExamStatus } from "@/types";

interface ExaminationDetailsProps {
  examination: Examination;
  onUpdateStatus: (status: ExamStatus) => Promise<void>;
}

export default function ExaminationDetails({
  examination,
  onUpdateStatus,
}: ExaminationDetailsProps) {
  if (!examination) {
    return (
      <div className="p-6 text-center text-gray-500">
        No examination data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Basic Information
          </h3>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Examination ID</p>
                <p className="font-medium">{examination.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      examination.status === ExamStatus.COMPLETED
                        ? "bg-green-100 text-green-800"
                        : examination.status === ExamStatus.IN_PROGRESS
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {examination.status}
                  </span>
                  <select
                    value={examination.status}
                    onChange={(e) => onUpdateStatus(e.target.value as ExamStatus)}
                    className="ml-2 text-sm border-gray-300 rounded-md"
                  >
                    {Object.values(ExamStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Examination Date</p>
              <p className="font-medium">
                {formatDateToLocale(examination.examDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created At</p>
              <p>{formatDateToLocale(examination.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p>{formatDateToLocale(examination.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Patient Information
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Patient ID</p>
              <p className="font-medium">
                {examination.patientId}
                {examination.patient && ` - ${examination.patient.name}`}
              </p>
            </div>
            {examination.patient && (
              <>
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p>{examination.patient.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p>{examination.patient.email}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Doctor Information
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Doctor ID</p>
              <p className="font-medium">
                {examination.doctorId}
                {examination.doctor && ` - ${examination.doctor.name}`}
              </p>
            </div>
            {examination.doctor && (
              <>
                <div>
                  <p className="text-xs text-gray-500">Specialization</p>
                  <p>{examination.doctor.specialization}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p>{examination.doctor.phone}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Symptoms and Notes */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Clinical Details
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Symptoms</p>
              <p className="whitespace-pre-wrap">
                {examination.symptoms || "None documented"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Additional Notes</p>
              <p className="whitespace-pre-wrap">
                {examination.notes || "None"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
