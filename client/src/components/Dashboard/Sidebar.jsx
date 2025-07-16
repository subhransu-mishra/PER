import React from "react";
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

const sections = [
  { name: "Dashboard", icon: <RxDashboard size={22} />, path: "." },
  {
    name: "Petty Cash",
    icon: <MdOutlinePayments size={22} />,
    path: "petty-cash",
  },
  { name: "Expenses", icon: <FiBarChart2 size={22} />, path: "expenses" },
  { name: "Revenue", icon: <FiDollarSign size={22} />, path: "revenue" },
  { name: "Reports", icon: <FiFileText size={22} />, path: "reports" },
  { name: "Settings", icon: <IoSettingsOutline size={22} />, path: "settings" },
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
          <img src="/Accure2.png" alt="Logo" className="w-20 h-22" />
        </div>
        {/* <span className="text-xl font-semibold text-gray-800">Accrue</span> */}
      </div>

      {/* Sidebar Sections */}
      <nav className="flex-1 flex flex-col mt-4 space-y-2 overflow-y-auto">
        {sections.map((section) => (
          <NavLink
            key={section.name}
            to={section.path}
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
            <div
              className={({ isActive }) =>
                `${isActive ? "text-blue-700" : "text-blue-600"}`
              }
            >
              {section.icon}
            </div>
            <span>{section.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
