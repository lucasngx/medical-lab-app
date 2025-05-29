"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { authService } from "@/services/authService";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  // List of public paths that don't require authentication
  const publicPaths = ["/login"];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if current path is public
  const isPublicPath = publicPaths.includes(pathname);

  return (
    <div className="flex h-screen">
      <div
        className={`fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
