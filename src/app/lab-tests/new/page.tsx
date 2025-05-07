"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LabTest } from "@/types";
import labTestService from "@/services/labTestService";

export default function NewLabTestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<LabTest>>({
    name: "",
    description: "",
    unit: "",
    refRange: {
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

      await labTestService.createLabTest(formData as Omit<LabTest, "id">);
      router.push("/lab-tests");
    } catch (err: any) {
      setError(err.message || "Failed to create lab test");
      console.error("Error creating lab test:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Create New Lab Test
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Test Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Complete Blood Count"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describe the purpose and details of this test"
            />
          </div>

          <div>
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700"
            >
              Unit *
            </label>
            <input
              type="text"
              id="unit"
              name="unit"
              required
              value={formData.unit}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., mg/dL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="refRangeMin"
                className="block text-sm font-medium text-gray-700"
              >
                Reference Range (Min) *
              </label>
              <input
                type="number"
                step="any"
                id="refRangeMin"
                name="refRangeMin"
                required
                value={formData.refRange?.min || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="refRangeMax"
                className="block text-sm font-medium text-gray-700"
              >
                Reference Range (Max) *
              </label>
              <input
                type="number"
                step="any"
                id="refRangeMax"
                name="refRangeMax"
                required
                value={formData.refRange?.max || ""}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Lab Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
