// src/components/forms/PrescriptionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Prescription, PrescriptionItem, Medication, Examination, ExamStatus } from "@/types";
import prescriptionService from "@/services/prescriptionService";
import examinationService from "@/services/examinationService";
import { v4 as uuidv4 } from 'uuid';

interface PrescriptionFormProps {
  prescriptionId?: number;
  examinationId?: number;
  onSuccess?: () => void;
}

export default function PrescriptionForm({
  prescriptionId,
  examinationId,
  onSuccess,
}: PrescriptionFormProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<Partial<Prescription>>({
    examinationId: examinationId || 0,
    diagnosis: "",
    notes: "",
  });

  const [prescriptionItems, setPrescriptionItems] = useState<
    (Partial<PrescriptionItem> & { tempId?: string })[]
  >([]);

  const isEditing = !!prescriptionId;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load medications for selection
        const medicationsResponse = await prescriptionService.getMedications(1, 100);
        setMedications(medicationsResponse.data);

        // Load available examinations (both in progress and completed)
        const [inProgressExams, completedExams] = await Promise.all([
          examinationService.getExaminations(1, 100, ExamStatus.IN_PROGRESS),
          examinationService.getExaminations(1, 100, ExamStatus.COMPLETED)
        ]);
        setExaminations([...inProgressExams.data, ...completedExams.data]);
        // If we have an examination ID, load examination details
        if (examinationId) {
          const examinationData = await examinationService.getExaminationById(examinationId);
          setExamination(examinationData);
          setFormData(prev => ({ ...prev, examinationId }));
        }

        // If editing an existing prescription, load its data
        if (prescriptionId) {
          const prescriptionData = await prescriptionService.getPrescriptionById(prescriptionId);
          setFormData({
            examinationId: prescriptionData.examinationId,
            diagnosis: prescriptionData.diagnosis,
            notes: prescriptionData.notes,
          });

          // Load examination data for the prescription
          const examData = await examinationService.getExaminationById(prescriptionData.examinationId);
          setExamination(examData);

          // Load prescription items
          const prescriptionItemsData = await prescriptionService.getPrescriptionItems(prescriptionId);
          setPrescriptionItems(prescriptionItemsData.map(item => ({
            ...item,
            tempId: uuidv4(),
          })));
        } else {
          // Add one empty item for new prescriptions
          addEmptyMedicationItem();
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setError("Failed to load required data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [prescriptionId, examinationId]);

  const handleExaminationChange = async (examinationId: number) => {
    try {
      const selectedExamination = await examinationService.getExaminationById(examinationId);
      setExamination(selectedExamination);
      setFormData(prev => ({ ...prev, examinationId }));
    } catch (error) {
      console.error("Failed to load examination details:", error);
      setError("Failed to load examination details. Please try again.");
    }
  };

  const handlePrescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addEmptyMedicationItem = () => {
    setPrescriptionItems(prev => [
      ...prev,
      {
        tempId: uuidv4(),
        medicationId: 0,
        dosage: "",
        frequency: "",
        duration: "",
      },
    ]);
  };

  const handleItemChange = (
    tempId: string,
    field: keyof PrescriptionItem,
    value: string | number
  ) => {
    setPrescriptionItems(prev =>
      prev.map(item =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (tempId: string) => {
    setPrescriptionItems(prev => prev.filter(item => item.tempId !== tempId));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.examinationId) {
    setError("No examination selected.");
    return;
  }

  if (!formData.diagnosis || prescriptionItems.length === 0) {
    setError("Please provide a diagnosis and at least one medication.");
    return;
  }

  // Check if all medication items have required fields
  const incompleteItems = prescriptionItems.filter(
    item => !item.medicationId || !item.dosage || !item.frequency
  );

  if (incompleteItems.length > 0) {
    setError("Please complete all required medication fields (medication, dosage, and frequency).");
    return;
  }

  setIsSaving(true);
  setError("");

  try {
    // Map your prescriptionItems to the DTO format expected by backend
    const items = prescriptionItems.map(item => ({
      medicationId: item.medicationId!,
      dosage: item.dosage!,
      duration: item.duration || "",  // Provide default if optional
      frequency: item.frequency!,
    }));

    // Build the full DTO for backend
    const prescriptionDTO = {
      examinationId: formData.examinationId!,
      diagnosis: formData.diagnosis!,
      notes: formData.notes || "",
      prescriptionItems: items,
    };

    // Call the single createPrescription API
    const createdPrescription = await prescriptionService.createPrescription(prescriptionDTO);


    if (onSuccess) {
      onSuccess();
    } else {
      router.push(`/examinations/${formData.examinationId}`);
    }
  } catch (error) {
    console.error("Failed to save prescription:", error);
    setError("Failed to save prescription. Please try again.");
  } finally {
    setIsSaving(false);
  }
};


  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredMedications = searchTerm
    ? medications.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : medications;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!examinationId && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <label htmlFor="examinationId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Examination *
          </label>
          <select
            id="examinationId"
            value={formData.examinationId || ""}
            onChange={(e) => handleExaminationChange(Number(e.target.value))}
            required
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select an examination</option>
              {examinations.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  Examination #{exam.id} - {exam.patient?.name || `Patient #${exam.patientId}`} | 
                  {new Date(exam.examDate).toLocaleDateString()} | 
                  {exam.doctor?.name} ({exam.doctor?.specialization}) | 
                  Status: {exam.status}
                </option>
              ))}

          </select>
        </div>
      )}

      {examination && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-blue-800">
            Examination #{examination.id}
          </h2>
          <p className="mt-1 text-sm text-blue-600">
            Patient: {examination.patient?.name || `Patient #${examination.patientId}`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
            Diagnosis *
          </label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            rows={3}
            required
            value={formData.diagnosis}
            onChange={handlePrescriptionChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter diagnosis details"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            value={formData.notes || ""}
            onChange={handlePrescriptionChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Any additional notes or instructions"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Medications</h3>
            <button
              type="button"
              onClick={addEmptyMedicationItem}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Medication
            </button>
          </div>

          <div className="space-y-4">
            {prescriptionItems.map((item, index) => (
              <div
                key={item.tempId}
                className="border border-gray-200 rounded-md p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Medication #{index + 1}
                  </h4>
                  {prescriptionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.tempId!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Medication *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search medications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <select
                        value={item.medicationId || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.tempId!,
                            "medicationId",
                            parseInt(e.target.value)
                          )
                        }
                        required
                        className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select a medication</option>
                        {filteredMedications.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={item.dosage || ""}
                      onChange={(e) =>
                        handleItemChange(item.tempId!, "dosage", e.target.value)
                      }
                      required
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <input
                      type="text"
                      value={item.frequency || ""}
                      onChange={(e) =>
                        handleItemChange(item.tempId!, "frequency", e.target.value)
                      }
                      required
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Twice daily"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={item.duration || ""}
                      onChange={(e) =>
                        handleItemChange(item.tempId!, "duration", e.target.value)
                      }
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., 7 days"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSaving
            ? "Saving..."
            : isEditing
            ? "Update Prescription"
            : "Create Prescription"}
        </button>
      </div>
    </form>
  );
}
