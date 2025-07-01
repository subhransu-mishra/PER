import React, { useState } from "react";
import {
  FiMenu,
  FiX,
  FiHome,
  FiDollarSign,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";

const sections = [
  { name: "Dashboard", icon: <FiHome size={22} /> },
  { name: "Petty Cash", icon: <MdOutlinePayments size={22} /> },
  { name: "Revenue", icon: <FiDollarSign size={22} /> },
  { name: "Expenses", icon: <FiBarChart2 size={22} /> },
  { name: "Reports", icon: <FiFileText size={22} /> },
];

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`h-full flex flex-col bg-gray-100 border-r transition-all duration-300 ease-in-out
        ${open ? "w-64" : "w-20"} shadow-lg relative z-20`}
    >
      {/* Toggle Button */}
      <button
        className={`absolute -right-4 top-4 w-8 h-8 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center transition-transform duration-300 z-30 ${
          open ? "rotate-0" : "rotate-180"
        }`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>
      {/* Sidebar Sections */}
      <nav className="flex-1 flex flex-col mt-16 space-y-2">
        {sections.map((section) => (
          <div
            key={section.name}
            className={`flex items-center gap-4 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 group
              hover:bg-blue-100 text-gray-700 font-medium
              ${open ? "justify-start" : "justify-center"}`}
          >
            <span className="text-blue-600">{section.icon}</span>
            <span
              className={`transition-all duration-200 origin-left
                ${open ? "opacity-100 scale-100" : "opacity-0 scale-0 w-0"}`}
            >
              {section.name}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
