// src/components/forms/TestResultForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, AlertCircle, Calendar, User, FileText, MessageSquare } from "lucide-react";
import { TestResult, ResultStatus, AssignedTest, TestStatus, Technician, Examination, LabTest, Patient } from "@/types";
import api from "@/services/api";
import labTestService from "@/services/labTestService";
import technicianService from "@/services/technicianService";
import assignedTestService from "@/services/assignedTestService";
import examinationService from "@/services/examinationService";
import patientService from "@/services/patientService";

interface TestResultFormProps {
  assignedTestId?: number;
  resultId?: number;
  examinationId?: number;
  onSuccess?: () => void;
}

export default function TestResultForm({
  assignedTestId,
  resultId,
  examinationId,
  onSuccess,
}: TestResultFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTest, setSelectedTest] = useState<AssignedTest | null>(null);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [labTest, setLabTest] = useState<LabTest | null>(null);
  const [formData, setFormData] = useState<Partial<TestResult>>({
    resultData: "",
    result: "",
    notes: "",
    resultDate: new Date().toISOString().split("T")[0],
    status: ResultStatus.PENDING,
    comment: "",
    technician: undefined,
    patient: undefined,
    test: undefined,
    assignedTestId: assignedTestId || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        console.log('📋 Fetching initial data with:', { assignedTestId, resultId, examinationId });
        
        if (!assignedTestId) {
          throw new Error("Assigned Test ID is required to create a test result");
        }

        // Set assignedTestId in formData first
        setFormData(prev => ({
          ...prev,
          assignedTestId: assignedTestId
        }));

        // Fetch assigned test details
        const res = await assignedTestService.getById(assignedTestId);
        if (!res) {
          throw new Error("Failed to fetch assigned test details");
        }
        
        console.log('📋 Assigned Test:', res);
        setLabTest(res.test || null);
        setSelectedTest(res);

        // Get current user's technician information from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (currentUser?.role === 'TECHNICIAN' && currentUser?.id) {
          const technicianDetails = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone,
            department: currentUser.department,
            organizationId: currentUser.organizationId,
            role: currentUser.role
          };
          
          setFormData(prev => ({
            ...prev,
            technician: technicianDetails
          }));
        } else {
          console.error('❌ Invalid user role or missing user ID:', currentUser);
          setError('You must be logged in as a technician to submit test results.');
        }

        // If we have an examination ID, fetch examination details
        if (examinationId) {
          const examData = await examinationService.getExaminationById(examinationId);
          setExamination(examData);

          if (examData.patientId) {
            const patientData = await patientService.getPatientById(examData.patientId);
            setPatient(patientData);
            setFormData(prev => ({
              ...prev,
              patient: patientData
            }));
          }

          const assignedTests = await assignedTestService.getAssignedTestsByExamination(examinationId);
          if (assignedTests.length > 0) {
            const test = assignedTests[0];
            setSelectedTest(test);
            setFormData(prev => ({
              ...prev,
              assignedTestId: test.id
            }));

            if (test.labTestId) {
              const testData = await labTestService.getLabTestById(test.labTestId);
              setLabTest(testData);
              setFormData(prev => ({
                ...prev,
                test: testData,
                testId: testData.id
              }));
            }
          }
        }
        
        // If we have an assigned test ID, fetch its details
        if (assignedTestId) {
          const test = await assignedTestService.getById(assignedTestId);
          setSelectedTest(test);
          
          if (test.labTestId) {
            const testData = await labTestService.getLabTestById(test.labTestId);
            setLabTest(testData);
            setFormData(prev => ({
              ...prev,
              test: testData,
              testId: testData.id
            }));
          }
        }

        // If we have a result ID, fetch existing result
        if (resultId) {
          const result = await api.get(`/test-results/${resultId}`);
          setFormData(result.data);
        }
      } catch (err) {
        console.error("❌ Error fetching initial data:", err);
        setError("Failed to load required data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [assignedTestId, resultId, examinationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Log form data before validation
      console.log('📝 Form data before submission:', {
        'Test': formData.test,
        'Test ID': formData.test?.id,
        'Lab Test': labTest,
        'Patient': formData.patient,
        'Technician': formData.technician,
        'Result': formData.result,
        'Status': formData.status
      });

      // Ensure all required fields are present
      if (!formData.result) {
        throw new Error("Result is required");
      }
      if (!formData.notes) {
        throw new Error("Notes are required");
      }
      if (!formData.resultDate) {
        throw new Error("Result date is required");
      }
      if (!formData.technician?.id) {
        throw new Error("Technician is required");
      }
      if (!formData.patient?.id) {
        throw new Error("Patient is required");
      }
      
     

      const payload = {
        technician: formData.technician,
        patient: formData.patient,
        test: labTest,
        assignedTestId: formData.assignedTestId,
        resultData: formData.resultData || "",
        result: formData.result,
        notes: formData.notes,
        resultDate: new Date(formData.resultDate).toISOString(),
        status: formData.status,
        comment: formData.comment || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('📝 Submitting Test Result:', {
        'Test Context': {
          'Assigned Test ID': payload.assignedTestId,
          'Test': payload.test,
          'Patient': payload.patient,
          'Technician': payload.technician
        },
        'Result Data': {
          'Result': payload.result,
          'Result Data': payload.resultData,
          'Notes': payload.notes,
          'Status': payload.status,
          'Date': payload.resultDate ? new Date(payload.resultDate).toLocaleString() : 'Not set'
        },
        'Additional Information': {
          'Comment': payload.comment,
          'Created At': payload.createdAt,
          'Updated At': payload.updatedAt
        }
      });

      if (resultId) {
        await api.put(`/api/test-results/${resultId}`, payload);
        console.log('✅ Successfully updated test result:', {
          'Result ID': resultId,
          'Update Time': new Date().toLocaleString()
        });
      } else {
        const response = await api.post("/api/test-results", payload);
        console.log('✅ Successfully created new test result:', {
          'New Result ID': response.data.id,
          'Creation Time': new Date().toLocaleString()
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/test-results");
      }
    } catch (err: any) {
      console.error("Error saving test result:", err);
      setError(err.response?.data?.message || err.message || "Failed to save test result");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Test Information Section */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Test Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Test Details</label>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-900 font-medium">{labTest?.name || 'Loading...'}</p>
                    <p className="text-sm text-gray-600 mt-1">{labTest?.description || 'No description available'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-900">Code: {labTest?.code || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Price: ${labTest?.price || '0.00'}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Reference Range: </span>
                  <span className="font-medium text-blue-900">
                    {labTest?.refRange?.min && labTest?.refRange?.max 
                      ? `${labTest.refRange.min} - ${labTest.refRange.max} ${labTest?.unit || ''}`
                      : 'Not specified'}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Status: </span>
                  <span className={`font-medium ${labTest?.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                    {labTest?.status || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Test Status</label>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <p className="text-blue-900">
                  <span className="font-medium">Status:</span> {selectedTest?.status || 'Not set'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Assigned Date:</span> {selectedTest?.assignedDate 
                    ? new Date(selectedTest.assignedDate).toLocaleString() 
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Patient & Examination Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Patient Information</label>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <p className="text-blue-900 font-medium">{patient?.name || 'Loading...'}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">DOB:</span> {patient?.dateOfBirth 
                      ? new Date(patient.dateOfBirth).toLocaleDateString() 
                      : 'Not set'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {patient?.phone || 'Not set'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {patient?.email || 'Not set'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Gender:</span> {patient?.gender || 'Not set'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Address:</span> {patient?.address || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Examination Details</label>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Examination ID:</span> {examination?.id ? `#${examination.id}` : 'Not set'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Date:</span> {examination?.examinationDate 
                    ? new Date(examination.examinationDate).toLocaleString() 
                    : 'Not set'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Status:</span> {examination?.status || 'Not set'}
                </p>
                {examination?.doctor && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Doctor:</span> {examination.doctor.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label htmlFor="resultDate" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline-block mr-1" />
            Result Date
          </label>
          <input
            type="date"
            id="resultDate"
            value={formData.resultDate?.split("T")[0] || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, resultDate: e.target.value }))
            }
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="relative">
        <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="h-4 w-4 inline-block mr-1" />
          Result
        </label>
        <input
          type="text"
          id="result"
          value={formData.result || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, result: e.target.value }))
          }
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="relative">
        <label htmlFor="resultData" className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="h-4 w-4 inline-block mr-1" />
          Result Data
        </label>
        <textarea
          id="resultData"
          value={formData.resultData || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, resultData: e.target.value }))
          }
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="relative">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="h-4 w-4 inline-block mr-1" />
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          required
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="relative">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="h-4 w-4 inline-block mr-1" />
          Comment
        </label>
        <textarea
          id="comment"
          value={formData.comment || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comment: e.target.value }))
          }
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="relative">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          value={formData.status || ResultStatus.PENDING}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as ResultStatus,
            }))
          }
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {Object.values(ResultStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
        >
          {isLoading ? "Saving..." : resultId ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

