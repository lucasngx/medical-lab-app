"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import examinationService from "@/services/examinationService";
import labTestService from "@/services/labTestService";
import prescriptionService from "@/services/prescriptionService";
import { formatDateToLocale } from "@/utils/dateUtils";
import {
  Examination,
  AssignedTest,
  ExamStatus,
  TestStatus,
  Prescription
} from "@/types";
import ExaminationDetails from "@/components/examinations/ExaminationDetails";
import AssignTestModal from "@/components/examinations/AssignTestModal";
import PrescriptionList from "@/components/prescriptions/PrescriptionList";

const ExaminationDetailPage = () => {
  const [examination, setExamination] = useState<Examination | null>(null);
  const [assignedTests, setAssignedTests] = useState<AssignedTest[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "tests" | "prescriptions">("details");
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [examData, testsData, prescriptionsData] = await Promise.all([
          examinationService.getExaminationById(Number(id)),
          labTestService.getAssignedTestsByExamination(Number(id)),
          prescriptionService.getPrescriptionsByExamination(Number(id))
        ]);
        
        setExamination(examData);
        setAssignedTests(testsData);
        setPrescriptions(prescriptionsData);
      } catch (error) {
        console.error('Error fetching examination data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleUpdateStatus = async (status: ExamStatus) => {
    if (!examination) return;
    
    try {
      const updatedExam = await examinationService.updateExaminationStatus(examination.id, status);
      setExamination(updatedExam);
    } catch (error) {
      console.error('Error updating examination status:', error);
    }
  };

  const handleAssignTest = async (labTestIds: number[]) => {
    if (!examination) return;
    
    try {
      const newAssignedTests = await examinationService.assignTests(examination.id, labTestIds);
      setAssignedTests(prev => [...prev, ...newAssignedTests]);
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error('Error assigning tests:', error);
    }
  };

  const handleRemoveTest = async (assignedTestId: number) => {
    if (!examination || !window.confirm("Are you sure you want to remove this test assignment?")) {
      return;
    }

    try {
      await examinationService.removeAssignedTest(examination.id, assignedTestId);
      setAssignedTests(prev => prev.filter(test => test.id !== assignedTestId));
    } catch (error) {
      console.error('Error removing test assignment:', error);
    }
  };

  const handleEnterResults = (assignedTestId: number) => {
    router.push(`/lab-tests/${assignedTestId}/results`);
  };

  const handleDeletePrescription = async (prescriptionId: number) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      await prescriptionService.deletePrescription(prescriptionId);
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!examination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Examination not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Examination Details
            </h1>
            <div className="space-x-4">
              <button
                onClick={() => router.push(`/examinations/${examination.id}/edit`)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Examination
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "details"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab("tests")}
                  className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "tests"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Lab Tests
                </button>
                <button
                  onClick={() => setActiveTab("prescriptions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "prescriptions"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Prescriptions
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === "details" && (
                <ExaminationDetails
                  examination={examination}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}

              {activeTab === "tests" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Assigned Lab Tests
                    </h2>
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Assign New Test
                    </button>
                  </div>

                  <div className="space-y-4">
                    {assignedTests.map((test) => (
                      <div
                        key={test.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{test.labTest?.name}</h3>
                            <p className="text-sm text-gray-500">
                              Assigned: {formatDateToLocale(test.assignedDate)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Status: {test.status}
                            </p>
                          </div>
                          <div className="space-x-2">
                            <button
                              onClick={() => handleEnterResults(test.id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Enter Results
                            </button>
                            <button
                              onClick={() => handleRemoveTest(test.id)}
                              className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {assignedTests.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No lab tests assigned yet
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "prescriptions" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Prescriptions
                    </h2>
                    <button
                      onClick={() =>
                        router.push(
                          `/prescriptions/new?examinationId=${examination.id}`
                        )
                      }
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Prescription
                    </button>
                  </div>

                  <PrescriptionList
                    prescriptions={prescriptions}
                    onDelete={handleDeletePrescription}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAssignModalOpen && (
        <AssignTestModal
          examinationId={examination.id}
          onAssign={handleAssignTest}
          onClose={() => setIsAssignModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ExaminationDetailPage;
