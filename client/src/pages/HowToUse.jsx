import React, { useState } from "react";
import Layout from "../components/Layout";
import { motion as Motion } from "framer-motion";
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
        "Setting up your account is the first step to managing your finances efficiently. Your organization details will be used throughout the system.",
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
        "The dashboard provides a comprehensive overview of your financial status, with real-time updates and important notifications.",
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
      description:
        "Track all your business expenses in one place. Categorize them appropriately for better financial reporting and analysis.",
    },
    {
      id: 4,
      title: "Handling Revenue",
      icon: <FaChartLine className="text-green-500 text-3xl mb-4" />,
      steps: [
        "Go to the 'Revenue' section from the dashboard",
        "Click 'Add New Revenue' to record income",
        "Enter source details, amount, date, and category",
        "Attach any supporting documents or invoices",
        "Save the revenue entry to update your financial records",
      ],
      description:
        "Keep track of all income sources with detailed categorization for accurate financial reporting and forecasting.",
    },
    {
      id: 5,
      title: "Petty Cash Management",
      icon: <MdPayments className="text-yellow-500 text-3xl mb-4" />,
      steps: [
        "Access the 'Petty Cash' module from the dashboard",
        "View current petty cash balance and transaction history",
        "Record withdrawals with 'New Withdrawal' button",
        "Record deposits with 'New Deposit' button",
        "Generate petty cash reports for specific time periods",
      ],
      description:
        "Efficiently manage small cash expenses with our petty cash tracking system. Keep a detailed log of all cash transactions.",
    },
    {
      id: 6,
      title: "Generating Reports",
      icon: <FaChartBar className="text-indigo-500 text-3xl mb-4" />,
      steps: [
        "Navigate to the 'Reports' section from the dashboard",
        "Select the type of report you want to generate",
        "Choose the time period for your report",
        "Apply any filters to focus on specific categories or accounts",
        "Export the report in your preferred format (PDF, Excel, CSV)",
      ],
      description:
        "Create comprehensive financial reports to analyze your business performance and make informed decisions.",
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
        "The admin dashboard provides a bird's-eye view of your entire organization's financial health and system usage.",
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
      description:
        "Control who has access to your financial system and what level of permissions each user has.",
    },
    {
      id: 3,
      title: "Approval Workflows",
      icon: <FaReceipt className="text-amber-500 text-3xl mb-4" />,
      steps: [
        "Access the 'Approval Queue' from the admin dashboard",
        "Review pending expense and petty cash requests",
        "Approve or reject requests with optional comments",
        "Set up approval rules and thresholds",
        "Delegate approval authority to other admins when needed",
      ],
      description:
        "Maintain financial control with customizable approval workflows for expenses and cash transactions.",
    },
    {
      id: 4,
      title: "System Configuration",
      icon: <MdSettings className="text-gray-700 text-3xl mb-4" />,
      steps: [
        "Go to 'System Settings' in the admin panel",
        "Configure organization details and fiscal year settings",
        "Set up expense categories and revenue sources",
        "Customize notification preferences",
        "Manage integration with other business systems",
      ],
      description:
        "Tailor the system to your organization's specific needs with flexible configuration options.",
    },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-blue-50 to-white">
        {/* Header Section */}
        <Motion.div
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
        </Motion.div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full mb-2 font-medium ${
                activeTab === "users"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("users")}
            >
              <span className="flex items-center cursor-pointer">
                <FaUserAlt className="mr-2" /> Regular Users
              </span>
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full mb-2 font-medium ${
                activeTab === "admin"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("admin")}
            >
              <span className="flex items-center cursor-pointer ">
                <RiAdminFill className="mr-2" /> Administrators
              </span>
            </Motion.button>
          </div>
        </div>

        {/* User Guides */}
        <Motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 pb-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className={`${activeTab === "users" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userGuides.map((guide) => (
                <Motion.div
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
                </Motion.div>
              ))}
            </div>
          </div>

          {/* Admin Guides */}
          <div className={`${activeTab === "admin" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {adminGuides.map((guide) => (
                <Motion.div
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
                </Motion.div>
              ))}
            </div>
          </div>
        </Motion.div>

        {/* Tips Section */}
        <Motion.div
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
        </Motion.div>

        {/* FAQ Section */}
        <Motion.div
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
        </Motion.div>
      </div>
    </Layout>
  );
};

export default HowToUse;
