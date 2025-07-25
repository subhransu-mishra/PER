import React from "react";
import { motion } from "framer-motion";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

import {
  BarChart3,
  DollarSign,
  Users,
  FileText,
  PieChart,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

// Animation variants for container elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animation variants for individual items
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const Features = () => {
  const featureCards = [
    {
      id: "petty-cash",
      icon: <DollarSign className="w-10 h-10 text-blue-600" />,
      title: "Petty Cash Management",
      description:
        "Track and manage petty cash transactions with ease. Record deposits, withdrawals, and reconcile balances in real-time.",
    },
    {
      id: "expense-tracking",
      icon: <TrendingUp className="w-10 h-10 text-indigo-600" />,
      title: "Expense Tracking",
      description:
        "Categorize and monitor all expenses. Attach receipts, set budgets, and get alerts when approaching limits.",
    },
    {
      id: "income-management",
      icon: <BarChart3 className="w-10 h-10 text-green-600" />,
      title: "Income Management",
      description:
        "Record and track all income sources. Generate detailed income reports and forecasts based on historical data.",
    },
    {
      id: "visual-reports",
      icon: <PieChart className="w-10 h-10 text-purple-600" />,
      title: "Visual Reports",
      description:
        "Transform your financial data into intuitive visualizations. Get actionable insights with customizable dashboards.",
    },
    {
      id: "multi-user-system",
      icon: <Users className="w-10 h-10 text-orange-600" />,
      title: "Multi-User System",
      description:
        "Collaborate with your team through role-based access controls. Define permissions for different user roles.",
    },
    {
      id: "document-management",
      icon: <FileText className="w-10 h-10 text-red-600" />,
      title: "Document Management",
      description:
        "Store and organize all financial documents securely. Quick search and retrieve documents when needed.",
    },
    {
      id: "audit-ready-reports",
      icon: <Shield className="w-10 h-10 text-cyan-600" />,
      title: "Audit-Ready Reports",
      description:
        "Generate comprehensive reports that are audit-ready. Keep track of approval workflows and compliance.",
    },
    {
      id: "real-time-statistics",
      icon: <Clock className="w-10 h-10 text-amber-600" />,
      title: "Real-Time Statistics",
      description:
        "Monitor key financial metrics in real-time. Get instant notifications for important financial activities.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div
        className="max-w-7xl mx-auto text-center mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={containerVariants}
      >
        <motion.h2
          className="text-base font-semibold text-blue-600 tracking-wide uppercase"
          variants={itemVariants}
        >
          Features
        </motion.h2>
        <motion.h1
          className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl"
          variants={itemVariants}
        >
          Manage Everything on One Platform
        </motion.h1>
        <motion.p
          className="mt-4 max-w-2xl mx-auto text-xl text-gray-500"
          variants={itemVariants}
        >
          Our comprehensive PER (Petty cash Expense Reporter) system streamlines
          financial management with powerful features designed for simplicity
          and efficiency.
        </motion.p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {featureCards.map((feature, index) => (
          <motion.div
            key={index}
            className="relative group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            variants={itemVariants}
          >
            {/* Card Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Border Effect on Hover */}
            <div className="absolute inset-0 border-2 border-blue-500/0 group-hover:border-blue-500/100 rounded-2xl transition-all duration-300"></div>

            {/* Card Content */}
            <div className="relative p-6 h-full flex flex-col">
              <div className="p-3 bg-blue-50 rounded-xl inline-flex items-center justify-center mb-4 group-hover:bg-white transition-colors duration-300 group-hover:scale-110 transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {feature.title}
              </h3>
              <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-200 flex-grow">
                {feature.description}
              </p>
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <Link
                  to={`/about#${feature.id}`} //Dynamic anchor link to the feature section
                  className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                >
                  Learn more
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="max-w-4xl mx-auto mt-20 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={itemVariants}
      >
        <div className="bg-blue-600 rounded-2xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full opacity-20"></div>
          <div className="absolute left-0 bottom-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500 rounded-full opacity-20"></div>

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl relative z-10">
            Ready to streamline your financial management?
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto relative z-10">
            Start managing your petty cash, expenses, and financial reports with
            our all-in-one platform today.
          </p>
          <div className="mt-8 flex justify-center space-x-4 relative z-10">
            <Link
              to="/"
              className="flex justify-center items-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 transform  transition-all duration-200 shadow-lg"
            >
              Get Started by Registering <MdOutlineKeyboardDoubleArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Features;
