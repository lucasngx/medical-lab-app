"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Role } from "@/types";

export default function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const { user } = useSelector((state: RootState) => state.auth);

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path: string) => {
    // In App Router, we can check against window.location.pathname
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    return currentPath === path || currentPath?.startsWith(`${path}/`);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Medical Lab System</h1>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            {user?.name?.[0] || "U"}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name || "User"}</p>
            <p className="text-sm text-gray-500">{user?.role || "Loading..."}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/dashboard")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              href="/doctors"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/doctors")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Doctors
            </Link>
          </li>

          <li>
            <Link
              href="/technicians"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/technicians")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Technicians
            </Link>
          </li>

          <li>
            <Link
              href="/medications"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/medications")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Medications
            </Link>
          </li>

          <li>
            <Link
              href="/test-results"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/test-results")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Test Results
            </Link>
          </li>

          <li>
            <Link
              href="/patients"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/patients")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Patients
            </Link>
          </li>

          <li>
            <Link
              href="/examinations"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/examinations")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Examinations
            </Link>
          </li>

          <li>
            <Link
              href="/lab-tests"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/lab-tests")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Lab Tests
            </Link>
          </li>

          <li>
            <Link
              href="/prescriptions"
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive("/prescriptions")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Prescriptions
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
