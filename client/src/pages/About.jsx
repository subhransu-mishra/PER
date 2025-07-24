import React, { useRef, useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useLocation } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  Globe,
  Award,
} from "lucide-react";

// Simple hook for reveal-on-scroll
function useRevealOnScroll(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);
  return [ref, visible];
}

const About = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Delay to allow the DOM to fully render
      const timeout = setTimeout(() => {
        const target = document.querySelector(location.hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });

          // Optional: Add temporary highlight
          target.classList.add("ring", "ring-blue-400", "ring-offset-2");
          setTimeout(() => {
            target.classList.remove("ring", "ring-blue-400", "ring-offset-2");
          }, 2000);
        }
      }, 200); // slightly longer delay just in case

      return () => clearTimeout(timeout);
    }
  }, [location]);

  // Animations: fade/slide-in for each section
  const [heroRef, heroVisible] = useRevealOnScroll();
  const [missionRef, missionVisible] = useRevealOnScroll();
  const [valuesRef, valuesVisible] = useRevealOnScroll();
  const [featuresRef, featuresVisible] = useRevealOnScroll();
  const [statsRef, statsVisible] = useRevealOnScroll();

  return (
    <Layout>
      {/* Hero Section with Gradient Background */}
      <section
        ref={heroRef}
        id="hero"
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 py-20 sm:py-32"
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ease-out ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Transforming Financial Management
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-blue-100 mb-10">
              We're revolutionizing how organizations handle their finances with our comprehensive,
              intuitive platform designed for the modern business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#features"
                className="rounded-full px-8 py-3 bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explore Features
              </a>
              <a
                href="#mission"
                className="rounded-full px-8 py-3 bg-blue-800 bg-opacity-40 text-white font-medium border border-blue-300 border-opacity-30 hover:bg-opacity-60 transition-colors duration-300"
              >
                Our Mission
              </a>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-48 left-0 right-0 h-96 bg-gradient-to-b from-blue-700/50 to-transparent blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
      </section>

      {/* Company Stats Section */}
      <section ref={statsRef} className="py-16 bg-white">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
            statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">25+</div>
              <p className="text-gray-600">Businesses Served</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">₹10M+</div>
              <p className="text-gray-600">Transactions Managed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <p className="text-gray-600">Uptime Guaranteed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-600">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} id="mission" className="py-20 bg-gray-50">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
            missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Simplifying Financial Management For Everyone
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that financial management shouldn't be complicated. Our platform empowers teams
                to focus on what matters most while maintaining complete transparency and control over their
                financial operations.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                To simplify financial management for organizations of all sizes by providing an intuitive,
                secure, and comprehensive platform that streamlines petty cash handling, expense tracking,
                and financial reporting.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Intuitive design that requires minimal training</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Enterprise-grade security protecting your data</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">Scalable solutions that grow with your business</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-4 bg-blue-100 rounded-3xl transform rotate-3"></div>
              <div className="absolute -inset-4 bg-indigo-100 rounded-3xl transform -rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Financial Management"
                className="relative z-10 w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} id="values" className="py-20 bg-white">
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
            valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-indigo-100 rounded-2xl mb-4">
              <Award className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto mb-6"></div>
            <p className="max-w-3xl mx-auto text-lg text-gray-600">
              Our values shape everything we do—from product development to customer support.
              They're the foundation of our commitment to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in complete visibility into all financial transactions and processes.
                No hidden fees, no obscure workflows—just clarity at every step.
              </p>
            </div>

            <div
              className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Efficiency</h3>
              <p className="text-gray-600 leading-relaxed">
                We design our systems to save you time and reduce errors. Every feature is optimized
                to streamline your workflow and maximize productivity.
              </p>
            </div>

            <div
              className="bg-gradient-to-br from-white to-green-50 p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Your financial data deserves the highest level of protection. We implement enterprise-grade
                security measures to ensure your information remains safe and private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section
        ref={featuresRef}
        id="features"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${
            featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-green-100 rounded-2xl mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="max-w-3xl mx-auto text-lg text-gray-600">
              Our comprehensive suite of financial management tools helps you take control of your finances
              with confidence and ease.
            </p>
          </div>

          {/* Featured Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature Card 1 */}
            <div id="petty-cash" className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="h-2 bg-blue-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <DollarSign className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Petty Cash Management</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Track and manage petty cash transactions with ease. Effortlessly record deposits
                  and withdrawals, and reconcile balances in real-time.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Real-time balance tracking
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Approval workflows
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Digital receipt management
                  </li>
                </ul>
               
              </div>
            </div>

            {/* Feature Card 2 */}
            <div id="expense-tracking" className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="h-2 bg-indigo-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-indigo-100 rounded-xl mr-4 group-hover:bg-indigo-200 transition-colors duration-300">
                    <TrendingUp className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Expense Tracking</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Gain full control over your organizational spending. Log, categorize, and monitor
                  every expense with precision and ease.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Custom expense categories
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Budget tracking and alerts
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Digital receipt attachments
                  </li>
                </ul>
               
              </div>
            </div>

            {/* Feature Card 3 */}
            <div id="income-management" className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="h-2 bg-green-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 rounded-xl mr-4 group-hover:bg-green-200 transition-colors duration-300">
                    <BarChart3 className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Income Management</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Keep a clear record of all your income sources and revenue streams. Log income,
                  generate reports, and forecast future trends.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Multiple income sources
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Revenue forecasting
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Custom reporting tools
                  </li>
                </ul>
               
              </div>
            </div>

            {/* Additional Feature Cards */}
            <div id="visual-reports" className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="h-2 bg-purple-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors duration-300">
                    <PieChart className="h-7 w-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Visual Reports</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Transform raw financial data into beautiful, actionable charts and dashboards
                  for better decision-making.
                </p>

              </div>
            </div>

            <div id="multi-user-system" className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="h-2 bg-orange-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-orange-100 rounded-xl mr-4 group-hover:bg-orange-200 transition-colors duration-300">
                    <Users className="h-7 w-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Multi-User System</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Collaborate with your entire team while maintaining control with our
                  role-based access system.
                </p>
            
              </div>
            </div>

            <div id="document-management" className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="h-2 bg-red-600"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-red-100 rounded-xl mr-4 group-hover:bg-red-200 transition-colors duration-300">
                    <FileText className="h-7 w-7 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Document Management</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Keep all financial documents organized and secure in one place, accessible
                  when you need them.
                </p>

              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
           
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">What Our Customers Say</h2>
            <div className="w-24 h-1 bg-white opacity-50 mx-auto"></div>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-20">
              <svg className="w-12 h-12 text-white opacity-20 mx-auto mb-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>

              <p className="text-xl text-white leading-relaxed mb-8">
                "This platform has completely transformed how we manage our finances. The petty cash and expense
                tracking features have saved us countless hours and eliminated errors. The visual reports give us
                insights we never had before."
              </p>

              <div className="flex items-center justify-center">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src="https://randomuser.me/api/portraits/women/42.jpg"
                    alt="Testimonial author"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-4 text-left">
                  <div className="font-medium text-white">Sarah Johnson</div>
                  <div className="text-blue-200">CFO, TechStart Inc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  Ready to transform your financial management?
                </h2>
                <p className="mt-3 max-w-3xl text-blue-100">
                  Join thousands of businesses that use our platform to simplify their finances.
                </p>
              </div>
              <div className="mt-8 flex flex-shrink-0 md:mt-0 md:ml-4">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-8"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
        