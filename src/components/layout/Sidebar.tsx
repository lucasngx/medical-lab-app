"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Role, User } from "@/types";
import { authService } from "@/services/authService";
import {
  Home,
  Users,
  Stethoscope,
  Clipboard,
  TestTube,
  FileText,
  UserPlus,
  Pill
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const [pathname, setPathname] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get the current pathname
    setPathname(window.location.pathname);
    // Get the user information
    setUser(authService.getCurrentUser());
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const renderMenuItems = () => {
    const menuItems = [];

    // Dashboard - available to all roles
    menuItems.push(
      <Link
        key="dashboard"
        href="/dashboard"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/dashboard")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Home className="h-5 w-5 mr-3" />
        Dashboard
      </Link>
    );

    // Add all menu items for all users
    menuItems.push(
      <Link
        key="patients"
        href="/patients"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/patients")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Users className="h-5 w-5 mr-3" />
        Patients
      </Link>,
      <Link
        key="doctors"
        href="/doctors"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/doctors")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Stethoscope className="h-5 w-5 mr-3" />
        Doctors
      </Link>,
      <Link
        key="technicians"
        href="/technicians"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/technicians")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <UserPlus className="h-5 w-5 mr-3" />
        Technicians
      </Link>,
      <Link
        key="examinations"
        href="/examinations"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/examinations")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Clipboard className="h-5 w-5 mr-3" />
        Examinations
      </Link>,
      <Link
        key="prescriptions"
        href="/prescriptions"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/prescriptions")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <FileText className="h-5 w-5 mr-3" />
        Prescriptions
      </Link>,
      <Link
        key="lab-tests"
        href="/lab-tests"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/lab-tests")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <TestTube className="h-5 w-5 mr-3" />
        Lab Tests
      </Link>,
      <Link
        key="test-results"
        href="/test-results"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/test-results")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <FileText className="h-5 w-5 mr-3" />
        Test Results
      </Link>,
      <Link
        key="medications"
        href="/medications"
        className={`flex items-center px-3 py-2 rounded-md ${
          isActive("/medications")
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Pill className="h-5 w-5 mr-3" />
        Medications
      </Link>
    );

    return menuItems;
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-semibold text-gray-800">Medical Lab</span>
      </div>
      <nav className="mt-6 px-3 space-y-1">{renderMenuItems()}</nav>
    </div>
  );
}
