"use client";

import { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import useAuth from "@/hooks/useAuth";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New test result available", time: "2 minutes ago" },
    { id: 2, message: "Dr. Smith assigned a new test", time: "1 hour ago" },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-500 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 flex-1 flex items-center">
              <div className="max-w-lg w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="ml-4 flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
                <Bell size={20} />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                    Notifications
                  </div>
                  {notifications.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-2 hover:bg-gray-50"
                        >
                          <p className="text-sm font-medium text-gray-800">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No new notifications
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user?.name.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
