import React, { useState } from "react";
import DashNavbar from "../components/Dashboard/DashNavbar";
import Sidebar from "../components/Dashboard/Sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 z-30 sm:hidden transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        <header className="h-16 flex items-center sticky top-0 z-20 sm:ml-64">
          <DashNavbar toggleSidebar={toggleSidebar} />
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-y-auto sm:ml-64 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
