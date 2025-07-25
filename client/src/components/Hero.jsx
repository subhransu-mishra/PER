import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";




// Animation variants for the container to orchestrate staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Stagger the animation of children by 0.3 seconds
    },
  },
};

// Animation variants for child elements (text and button)
const itemVariants = {
  hidden: { y: 20, opacity: 0 }, // Start 20px below and invisible
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const Hero = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-50 rounded-full opacity-20 animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-75 rounded-full opacity-40 animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-gray-900 mb-4 leading-tight"
            variants={itemVariants}
          >
            Manage Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Finances with Ease &
            </span>
            <br />
            Effortlessly
          </motion.h1>
          <motion.p
            className="text-lg lg:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Streamline your Finance Entries with our powerful, intuitive
            platform. Track, monitor, and optimize your resources with
            cutting-edge technology.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <Link
              to="/how-to-use"
              className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 cursor-pointer"
            >
              Learn More
              <MdOutlineKeyboardDoubleArrowRight className="w-5 h-5 ml-2 -mr-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-blue-600" />
        </div>
      </section>
    </div>
  );
};

export default Hero;
