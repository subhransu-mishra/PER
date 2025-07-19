import React, { useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

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

const Contact = () => {
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Subject: "",
    Message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.FullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.Email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.Subject.trim()) {
      toast.error("Subject is required");
      return false;
    }
    if (!formData.Message.trim()) {
      toast.error("Message is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        "http://localhost:3000/api/contact/new-contact",
        {
          FullName: formData.FullName.trim(),
          Email: formData.Email.trim(),
          Subject: formData.Subject.trim(),
          Message: formData.Message.trim(),
        },
        config
      );

      if (response.data) {
        console.log("Form submitted:", response.data);
        toast.success("Message sent successfully!");
        setFormData({
          FullName: "",
          Email: "",
          Subject: "",
          Message: "",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send message. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          className="max-w-7xl mx-auto text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl lg:text-6xl"
            variants={itemVariants}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="mt-6 max-w-3xl mx-auto text-xl text-gray-500 dark:text-gray-300"
            variants={itemVariants}
          >
            Have questions or queries? We'd love to hear from you. Send us a
            message and we'll respond as soon as possible.
          </motion.p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {/* Contact Form */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a message
              </h2>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="FullName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="FullName"
                    name="FullName"
                    value={formData.FullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="Email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="Email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Enter your email address"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="Subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="Subject"
                    name="Subject"
                    value={formData.Subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="What is this about?"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="Message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="Message"
                    name="Message"
                    value={formData.Message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder="Tell us more about your inquiry..."
                  />
                </motion.div>

                <motion.button
                  type="submit"
                  className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                </motion.button>
              </motion.form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Get in touch
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  We are here to help and answer any question you might have. We
                  look forward to hearing from you.
                </p>
              </motion.div>

              <motion.div className="space-y-6" variants={containerVariants}>
                <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Email Us
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">contact@per.com</p>
                    <p className="text-gray-600 dark:text-gray-400">info@per.com</p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Call Us
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">(+1) 123-456-7890</p>
                    <p className="text-gray-600 dark:text-gray-400">(+1) 987-654-3210</p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Visit Us
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      123 Finance Street, Suite 100, Business City, 54321
                    </p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Business Hours
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Monday - Friday: 9:00 AM - 6:00 PM
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Saturday: 10:00 AM - 4:00 PM
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Sunday: Closed</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
