import React from "react";
import { motion } from "framer-motion";
import { FaFacebookF } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa6";
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const Footer = () => {
  return (
    <motion.footer
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-pulse"></div>
      </div>

      <div className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
            variants={containerVariants}
          >
            {/* Brand Section */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <div className="mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Accrue
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                  Revolutionizing financial management easily and efficiently.
                  Join us in transforming the way you handle your finances.
                </p>
              </div>

              {/* Social Media Links */}
              <div className="flex space-x-4  transition-colors duration-300">
                <Link to="#">
                  <FaFacebookF className="w-6 h-6 hover:text-blue-600" />
                </Link>
                <Link to="#">
                  <FaXTwitter className="w-6 h-6 hover:text-blue-600" />
                </Link>
                <Link to="#">
                  <FaInstagram className="w-6 h-6 hover:text-blue-600" />
                </Link>
                <Link to="#">
                  <FaLinkedinIn className="w-6 h-6 hover:text-blue-600" />
                </Link>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-white mb-6 relative">
                Navigation
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Home", path: "/" },
                  { name: "About Us", path: "/about" },
                  { name: "Features", path: "/features" },
                  { name: "Pricing", path: "/pricing" },
                  { name: "Contact", path: "/contact" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.path}
                      className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-white mb-6 relative">
                Services
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Expense Tracking", path: "/expense-tracking" },
                  { name: "Revenue Management", path: "/revenue" },
                  { name: "Petty Cash Control", path: "/petty-cash" },
                  { name: "Analytics & Reports", path: "/analytics" },
                  { name: "Subscriptions", path: "/subscriptions" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.path}
                      className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support & Legal */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-white mb-6 relative">
                Support & Legal
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              </h3>

              {/* Contact Info */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href="mailto:contact@accrue.com"
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-300"
                  >
                    support@accrue.com
                  </a>
                </div>
                <div className="flex items-center mb-2">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-slate-300">+91-9876543210</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-slate-300 text-sm">
                    Mon – Fri, 9AM – 6PM
                  </span>
                </div>
              </div>

              {/* Legal Links */}
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Privacy Policy", path: "/privacy" },
                  { name: "Terms of Service", path: "/terms" },
                  { name: "Cookie Policy", path: "/cookies" },
                  { name: "Register", path: "/register" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.path}
                      className="text-slate-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div
            className="border-t border-slate-700 pt-8"
            variants={itemVariants}
          >
            <div className="flex flex-col justify-center items-center text-sm">
              <div className="text-slate-400 mb-2">
                © {new Date().getFullYear()} ITPlusPoint. All rights reserved.
              </div>
              <div className="text-slate-400">
                Made with for modern financial management world
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
