import React, { useState } from "react";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import {
  FaUserAlt,
  FaChartLine,
  FaMoneyBillWave,
  FaReceipt,
  FaUsers,
  FaChartBar,
} from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { MdDashboard, MdPayments, MdSettings } from "react-icons/md";

// This is to satisfy the linter
const M = motion;

const HowToUse = () => {
  const [activeTab, setActiveTab] = useState("users");

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const userGuides = [
    {
      id: 1,
      title: "Creating an Account",
      icon: <FaUserAlt className="text-blue-500 text-3xl mb-4" />,
      steps: [
        "Click on the 'Register' button in the top navigation bar",
        "Fill in your personal details and organization information",
        "Create a strong password for your account",
        "Verify your email address through the confirmation link",
        "Log in with your new credentials",
      ],
      description:
        "Setting up your account is the first step to managing your finances efficiently.",
    },
    {
      id: 2,
      title: "Navigating the Dashboard",
      icon: <MdDashboard className="text-purple-500 text-3xl mb-4" />,
      steps: [
        "After logging in, you'll be directed to your personalized dashboard",
        "View key financial metrics and summary cards at a glance",
        "Use the sidebar to navigate between different sections",
        "Customize your dashboard layout using the settings icon",
        "Access quick actions from the dashboard header",
      ],
      description:
        "The dashboard provides a comprehensive overview of your financial status.",
    },
    {
      id: 3,
      title: "Managing Expenses",
      icon: <FaMoneyBillWave className="text-red-500 text-3xl mb-4" />,
      steps: [
        "Navigate to the 'Expenses' section from the dashboard sidebar",
        "Click 'Add New Expense' to record a new transaction",
        "Fill in the expense details, amount, date, and category",
        "Attach receipts or supporting documents (if available)",
        "Submit the expense for approval (if required by your organization)",
      ],
      description: "Track all your business expenses in one place.",
    },
  ];

  const adminGuides = [
    {
      id: 1,
      title: "Admin Dashboard Overview",
      icon: <RiAdminFill className="text-blue-600 text-3xl mb-4" />,
      steps: [
        "Log in with admin credentials to access enhanced features",
        "View organization-wide financial metrics and KPIs",
        "Monitor user activity and system usage statistics",
        "Access admin-specific tools and settings",
        "Review system notifications and alerts",
      ],
      description:
        "The admin dashboard provides a bird's-eye view of your organization's finances.",
    },
    {
      id: 2,
      title: "User Management",
      icon: <FaUsers className="text-violet-500 text-3xl mb-4" />,
      steps: [
        "Navigate to 'User Management' in the admin panel",
        "Add new users with the 'Add User' button",
        "Assign appropriate roles and permissions",
        "Edit existing user details or change access levels",
        "Deactivate accounts when needed while preserving data",
      ],
      description: "Control who has access to your financial system.",
    },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-blue-50 to-white">
        {/* Header Section */}
        <M.div
          className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            How to Use <span className="text-blue-600">Accrue</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive guide to help you navigate our financial management
            system and make the most of its powerful features.
          </p>
        </M.div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
            <M.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full mb-2 font-medium ${
                activeTab === "users"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("users")}
            >
              <span className="flex items-center">
                <FaUserAlt className="mr-2" /> Regular Users
              </span>
            </M.button>
            <M.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full mb-2 font-medium ${
                activeTab === "admin"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("admin")}
            >
              <span className="flex items-center">
                <RiAdminFill className="mr-2" /> Administrators
              </span>
            </M.button>
          </div>
        </div>

        {/* User Guides */}
        <M.div
          className="max-w-7xl mx-auto px-4 sm:px-6 pb-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className={`${activeTab === "users" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userGuides.map((guide) => (
                <M.div
                  key={guide.id}
                  variants={fadeIn}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex justify-center">{guide.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{guide.description}</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Step-by-Step Guide:
                      </h4>
                      <ol className="space-y-2">
                        {guide.steps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center mr-3 font-medium text-sm">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </M.div>
              ))}
            </div>
          </div>

          {/* Admin Guides */}
          <div className={`${activeTab === "admin" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {adminGuides.map((guide) => (
                <M.div
                  key={guide.id}
                  variants={fadeIn}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex justify-center">{guide.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{guide.description}</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">
                        Step-by-Step Guide:
                      </h4>
                      <ol className="space-y-2">
                        {guide.steps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center mr-3 font-medium text-sm">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </M.div>
              ))}
            </div>
          </div>
        </M.div>

        {/* Tips Section */}
        <M.div
          className="bg-blue-600 text-white py-12 sm:py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              Pro Tips for Getting the Most from Accrue
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-700 bg-opacity-40 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3">Regular Backups</h3>
                <p>
                  Export your financial data regularly to ensure you always have
                  a backup of your important records.
                </p>
              </div>
              <div className="bg-blue-700 bg-opacity-40 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3">
                  Use Categories Consistently
                </h3>
                <p>
                  Develop a consistent approach to categorizing expenses and
                  revenue for more accurate reporting.
                </p>
              </div>
              <div className="bg-blue-700 bg-opacity-40 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3">Mobile Access</h3>
                <p>
                  Use our responsive design to access your financial data on the
                  go from any mobile device.
                </p>
              </div>
            </div>
          </div>
        </M.div>

        {/* FAQ Section */}
        <M.div
          className="py-16 sm:py-20 px-4 sm:px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Can multiple users work on the same organization account?
                </h3>
                <p className="text-gray-600">
                  Yes, administrators can add multiple users to a single
                  organization account with different permission levels.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  How secure is my financial data?
                </h3>
                <p className="text-gray-600">
                  We use industry-standard encryption and security practices to
                  ensure your data remains private and secure.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Can I import data from other financial systems?
                </h3>
                <p className="text-gray-600">
                  Yes, Accrue supports importing data from CSV files and several
                  popular accounting software platforms.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Is there a mobile app available?
                </h3>
                <p className="text-gray-600">
                  While we don't have a dedicated mobile app yet, our platform
                  is fully responsive and works excellently on mobile browsers.
                </p>
              </div>
            </div>
          </div>
        </M.div>
      </div>
    </Layout>
  );
};

export default HowToUse;
