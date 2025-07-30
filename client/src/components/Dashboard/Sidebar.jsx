import React from "react";
import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiBarChart2,
  FiFileText,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { MdOutlinePayments } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosAnalytics } from "react-icons/io";

const sections = [
  { name: "Dashboard", icon: RxDashboard, path: "/dashboard" },
  {
    name: "Petty Cash",
    icon: MdOutlinePayments,
    path: "/dashboard/petty-cash",
  },
  {
    name: "Expenses",
    icon: FiBarChart2,
    path: "/dashboard/expenses",
  },
  {
    name: "Revenue",
    icon: FiDollarSign,
    path: "/dashboard/revenue",
  },
  {
    name: "Analytics",
    icon: IoIosAnalytics,
    path: "/dashboard/analytics",
  },
  {
    name: "Settings",
    icon: IoSettingsOutline,
    path: "/dashboard/settings",
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-screen flex flex-col bg-white/95 backdrop-blur-sm shadow-lg z-40 w-64 transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0`}
    >
      {/* Close button for mobile */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 sm:hidden"
        aria-label="Close sidebar"
      >
        <FiX size={18} />
      </button>

      {/* Logo + Company Name */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="rounded-full  text-white flex items-center justify-center text-xl font-bold">
          <Link to="/">
            <img src="/Accure2.png" alt="Logo" className="w-16 h-18" />
          </Link>
        </div>
        {/* <span className="text-xl font-semibold text-gray-800">Accrue</span> */}
      </div>

      {/* Sidebar Sections */}
      <nav className="flex-1 flex flex-col mt-4 space-y-2 overflow-y-auto px-2">
        {sections.map((section) => (
          <NavLink
            key={section.name}
            to={section.path}
            end={section.path === "/dashboard"} // Ensures only dashboard index is active on /dashboard
            onClick={() => window.innerWidth < 640 && toggleSidebar()}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 group
              ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 font-medium hover:bg-blue-50"
              }`
            }
          >
            {({ isActive }) => {
              const Icon = section.icon;
              return (
                <>
                  <Icon
                    size={22}
                    className={isActive ? "text-blue-700" : "text-blue-600"}
                  />
                  <span>{section.name}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
