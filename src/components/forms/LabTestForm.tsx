"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LabTest } from "@/types";
import labTestService from "@/services/labTestService";

interface LabTestFormProps {
  initialData?: Partial<LabTest>;
  onSuccess?: () => void;
}

export default function LabTestForm({ initialData, onSuccess }: LabTestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<LabTest>>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    unit: initialData?.unit || "",
    refRange: initialData?.refRange || {
      min: 0,
      max: 0,
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "refRangeMin" || name === "refRangeMax") {
      setFormData((prev) => ({
        ...prev,
        refRange: {
          ...prev.refRange!,
          [name === "refRangeMin" ? "min" : "max"]: parseFloat(value) || 0,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate form data
      if (formData.refRange!.min > formData.refRange!.max) {
        throw new Error("Minimum value cannot be greater than maximum value");
      }

      if (initialData?.id) {
        await labTestService.updateLabTest(initialData.id, formData);
      } else {
        await labTestService.createLabTest(formData as Omit<LabTest, "id">);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/lab-tests");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save lab test");
      console.error("Error saving lab test:", err);
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

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Test Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
          Unit *
        </label>
        <input
          id="unit"
          name="unit"
          type="text"
          required
          value={formData.unit}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="refRangeMin" className="block text-sm font-medium text-gray-700">
            Minimum Value *
          </label>
          <input
            id="refRangeMin"
            name="refRangeMin"
            type="number"
            step="any"
            required
            value={formData.refRange?.min}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="refRangeMax" className="block text-sm font-medium text-gray-700">
            Maximum Value *
          </label>
          <input
            id="refRangeMax"
            name="refRangeMax"
            type="number"
            step="any"
            required
            value={formData.refRange?.max}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
