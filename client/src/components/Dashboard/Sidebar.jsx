import React from "react";
import {
  FiHome,
  FiDollarSign,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";
import { Link } from "react-router-dom";

const sections = [
  { name: "Dashboard", icon: <FiHome size={22} />, path: "." },
  { name: "Petty Cash", icon: <MdOutlinePayments size={22} />, path: "petty-cash" },
  { name: "Revenue", icon: <FiDollarSign size={22} />, path: "revenue" },
  { name: "Expenses", icon: <FiBarChart2 size={22} />, path: "expenses" },
  { name: "Reports", icon: <FiFileText size={22} />, path: "reports" },
];

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-screen flex flex-col bg-white shadow-md z-20 w-64">
      {/* Logo + Company Name */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
          MP
        </div>
        <span className="text-xl font-semibold text-gray-800">
          MudraPanel
        </span>
      </div>

      {/* Sidebar Sections */}
      <nav className="flex-1 flex flex-col mt-4 space-y-2">
        {sections.map((section) => (
          <Link
            key={section.name}
            to={section.path}
            className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 group hover:bg-blue-100 text-gray-700 font-medium"
          >
            <div className="text-blue-600">{section.icon}</div>
            <span>{section.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
