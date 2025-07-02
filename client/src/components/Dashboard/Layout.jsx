import React, { useState } from "react";
import { FiHome, FiDollarSign, FiBarChart2, FiFileText, FiMenu } from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";
import { Link } from "react-router-dom";

const sections = [
  { name: "Dashboard", icon: <FiHome size={20} />, path: "." },
  { name: "Petty Cash", icon: <MdOutlinePayments size={20} />, path: "petty-cash" },
  { name: "Revenue", icon: <FiDollarSign size={20} />, path: "revenue" },
  { name: "Expenses", icon: <FiBarChart2 size={20} />, path: "expenses" },
  { name: "Reports", icon: <FiFileText size={20} />, path: "reports" },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 flex items-center justify-between">
          <div className="flex items-center">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <span className="sr-only">Open sidebar</span>
              <FiMenu className="w-6 h-6" />
            </button>
            {/* Logo */}
            <Link to="/" className="flex items-center ms-2 md:me-24">
              <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 me-3" alt="Logo" />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">MudraPanel</span>
            </Link>
          </div>
          {/* User menu */}
          <div className="flex items-center">
            <button
              type="button"
              className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
            >
              <span className="sr-only">Open user menu</span>
              <img
                className="w-8 h-8 rounded-full"
                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="user"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
          <ul className="space-y-2 font-medium">
            {sections.map((section) => (
              <li key={section.name}>
                <Link
                  to={section.path}
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-gray-500 group-hover:text-gray-900">{section.icon}</span>
                  <span className="ms-3">{section.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <div className="p-4 sm:ml-64">
        <div className="mt-16">{children}</div>
      </div>
    </div>
  );
}