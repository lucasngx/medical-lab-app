"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Medication } from '@/types';
import medicationService from '@/services/medicationService';
import { useNotification } from '@/hooks/useNotification';

interface MedicationFormProps {
  initialData?: Partial<Medication>;
  onSuccess?: () => void;
}

export default function MedicationForm({ initialData, onSuccess }: MedicationFormProps) {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: initialData?.name || "",
    dosageInfo: initialData?.dosageInfo || "",
    sideEffects: initialData?.sideEffects || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (initialData?.id) {
        await medicationService.updateMedication(initialData.id, formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Medication updated successfully'
        });
      } else {
        await medicationService.createMedication(formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Medication created successfully'
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/medications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save medication");
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save medication'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Medication Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="dosageInfo" className="block text-sm font-medium text-gray-700">
            Dosage Information *
          </label>
          <textarea
            id="dosageInfo"
            name="dosageInfo"
            required
            rows={3}
            value={formData.dosageInfo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter detailed dosage information..."
          />
        </div>

        <div>
          <label htmlFor="sideEffects" className="block text-sm font-medium text-gray-700">
            Side Effects *
          </label>
          <textarea
            id="sideEffects"
            name="sideEffects"
            required
            rows={3}
            value={formData.sideEffects}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter possible side effects..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (initialData?.id ? 'Update' : 'Create')} Medication
        </button>
      </div>
    </form>
  );
}
