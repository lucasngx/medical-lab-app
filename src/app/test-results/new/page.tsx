"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestResult, AssignedTest } from "@/types";
import TestResultForm from "@/components/forms/TestResultForm";
import api from "@/services/api";

export default function NewTestResultPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/test-results");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/test-results"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Test Results</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Test Result
      </h1>

      <TestResultForm onSuccess={handleSuccess} />
    </div>
  );
}