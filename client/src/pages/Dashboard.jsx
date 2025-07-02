import React from "react";
import DashNavbar from "../components/Dashboard/DashNavbar";
import Sidebar from "../components/Dashboard/Sidebar";

const Dashboard = () => {
  return ( 
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 border-r">
        <Sidebar />
      </aside>   
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center">
          <DashNavbar />
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          {/* Main dashboard content goes here, changes with tabs */}
          <div>Dashboard Main Content</div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
 