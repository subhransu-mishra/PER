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

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div
          ref={heroRef}
          id="hero"
          className={`max-w-7xl mx-auto text-center mb-16 transition-all duration-1000 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            About Accrue
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500">
            We're revolutionizing the way organizations manage their petty cash
            and expenses with our comprehensive financial management platform.
          </p>
        </div>

        {/* Mission Section */}
        <div
          ref={missionRef}
          id="mission"
          className={`max-w-7xl mx-auto mb-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                To simplify financial management for organizations of all sizes
                by providing an intuitive, secure, and comprehensive platform
                that streamlines petty cash handling, expense tracking, and
                financial reporting.
              </p>
              <p className="text-lg text-gray-600">
                We believe that managing finances shouldn't be complicated. Our
                platform empowers teams to focus on what matters most while
                maintaining complete transparency and control over their
                financial operations.
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">P</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Finance
                </h3>
                <p className="text-gray-600">
                  Efficient management and tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div
          ref={valuesRef}
          id="values"
          className={`max-w-7xl mx-auto mb-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Each card gets a hover and reveal effect */}
            <div className={`text-center transform transition-all duration-700 ${valuesVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} hover:scale-105 hover:shadow-xl bg-white rounded-xl py-6 px-4` }>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Transparency
              </h3>
              <p className="text-gray-600">
                Complete visibility into all financial transactions and
                processes.
              </p>
            </div>
            <div className={`text-center transform transition-all duration-700 delay-100 ${valuesVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} hover:scale-105 hover:shadow-xl bg-white rounded-xl py-6 px-4` }>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Efficiency
              </h3>
              <p className="text-gray-600">
                Streamlined processes that save time and reduce manual errors.
              </p>
            </div>
            <div className={`text-center transform transition-all duration-700 delay-200 ${valuesVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} hover:scale-105 hover:shadow-xl bg-white rounded-xl py-6 px-4` }>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-spin-slow">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Security
              </h3>
              <p className="text-gray-600">
                Enterprise-grade security to protect your financial data.
              </p>
            </div>
          </div>
        </div>

        {/* Features Detail Section */}
        {/* Features Detailed Description Section */}
        <div
          ref={featuresRef}
          className={`max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16 transition-all duration-1000 ease-out ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          {/* Petty Cash Management */}
          <div
            id="petty-cash"
            className="bg-white shadow-md rounded-xl p-6 sm:p-8 hover:shadow-2xl transition-shadow duration-500"
          >
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Petty Cash Management
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Track and manage petty cash transactions with ease. Effortlessly
              record deposits and withdrawals, and reconcile balances in
              real-time to maintain financial clarity.
            </p>

            <p className="text-gray-700 mb-4">
              Petty cash is essential for handling day-to-day operational
              expenses like office supplies, courier charges, and staff
              reimbursements. Our PER system simplifies petty cash handling by
              providing a streamlined, secure, and centralized module that
              enables you to:
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="text-green-600">✔</span> Record deposits and
                withdrawals with instant updates
              </li>
              <li>
                <span className="text-green-600">✔</span> Track spending
                patterns across departments or teams
              </li>
              <li>
                <span className="text-green-600">✔</span> Assign limits to
                prevent overspending
              </li>
              <li>
                <span className="text-green-600">✔</span> Enable approval
                workflows for transparency and accountability
              </li>
              <li>
                <span className="text-green-600">✔</span> Reconcile balances
                automatically to reduce human error
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              With real-time tracking and built-in audit trails, you'll never
              lose sight of your small but critical transactions. Whether you're
              a startup, NGO, or large organization, our tool ensures your petty
              cash fund is well-managed, traceable, and audit-ready.
            </p>

            <p className="text-gray-700 mt-4">
              Empower your team to handle small purchases without the chaos of
              spreadsheets or manual registers. Our platform brings clarity and
              control to your financial flow—right from the smallest coin.
            </p>
          </div>

          {/* Expense Tracking */}
          <div
            id="expense-tracking"
            className="bg-white shadow-md rounded-xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Expense Tracking
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Gain full control over your organizational spending. Our system
              allows you to log, categorize, and monitor every expense, whether
              it's recurring or one-time.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="text-green-600">✔</span> Categorize expenses
                for better insights and budgeting
              </li>
              <li>
                <span className="text-green-600">✔</span> Attach digital
                receipts and proofs for every entry
              </li>
              <li>
                <span className="text-green-600">✔</span> Set budget limits and
                receive alerts when nearing thresholds
              </li>
              <li>
                <span className="text-green-600">✔</span> Analyze trends with
                visual dashboards
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              Eliminate guesswork from your spending habits and foster
              accountability across departments with clear and concise expense
              records.
            </p>
          </div>

          {/* Income Management */}
          <div
            id="income-management"
            className="bg-white shadow-md rounded-xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Income Management
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Keep a clear record of all your income sources and revenue
              streams. Our module makes it simple to log income, generate
              reports, and forecast future trends.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="text-green-600">✔</span> Record income by
                source with custom tags
              </li>
              <li>
                <span className="text-green-600">✔</span> Monitor recurring vs.
                one-time income
              </li>
              <li>
                <span className="text-green-600">✔</span> Generate income
                reports with filtering options
              </li>
              <li>
                <span className="text-green-600">✔</span> Forecast future cash
                flow based on historical data
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              Whether you're tracking donations, grants, sales, or services, PER
              helps ensure you never miss a cent.
            </p>
          </div>

          {/* Visual Reports */}
          <div
            id="visual-reports"
            className="bg-white shadow-md rounded-xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-4">
                <PieChart className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Visual Reports
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Transform your raw financial data into beautiful, actionable
              charts and dashboards. Visualize trends, spot anomalies, and make
              informed decisions.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="text-green-600">✔</span> Generate pie charts,
                bar graphs, and line charts instantly
              </li>
              <li>
                <span className="text-green-600">✔</span> Interactive dashboards
                with filtering options
              </li>
              <li>
                <span className="text-green-600">✔</span> Export visuals for
                reports and presentations
              </li>
              <li>
                <span className="text-green-600">✔</span> Drill down into
                categories and timeframes
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              Bring data to life and gain financial clarity with insights that
              go beyond spreadsheets.
            </p>
          </div>

          {/* Multi-User System */}
          <div
            id="multi-user-system"
            className="bg-white shadow-md rounded-xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Multi-User System
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Collaborate with your entire team while maintaining control. The
              multi-user system is built to scale with your organization.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="text-green-600">✔</span> Role-based access for
                admins, accountants, and team members
              </li>
              <li>
                <span className="text-green-600">✔</span> Set permissions and
                manage user activity logs
              </li>
              <li>
                <span className="text-green-600">✔</span> Collaborate on reports
                and transactions in real-time
              </li>
              <li>
                <span className="text-green-600">✔</span> Secure login with
                session management
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              No more sharing passwords or risking data leaks—just seamless and
              secure teamwork.
            </p>
          </div>

          {/* Document Management */}
          <div
            id="document-management"
            className="bg-white shadow-md rounded-xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Document Management
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Keep all financial documents organized and secure in one place.
              Our document system is built for convenience and compliance.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="text-green-600">✔</span> Upload and tag
                invoices, receipts, and approvals
              </li>
              <li>
                <span className="text-green-600">✔</span> Smart search with
                filters and metadata
              </li>
              <li>
                <span className="text-green-600">✔</span> Encrypted storage for
                security and compliance
              </li>
              <li>
                <span className="text-green-600">✔</span> Download or share
                documents with access control
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              Say goodbye to missing receipts or overflowing file
              cabinets—access documents from anywhere, anytime.
            </p>
          </div>

          {/* Audit-Ready Reports */}
          <div
            id="audit-ready-reports"
            className="bg-white shadow-md rounded-xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Audit-Ready Reports
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Stay ready for audits at any time with our transparent and
              traceable financial reporting features.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="text-green-600">✔</span> Generate compliant
                reports instantly
              </li>
              <li>
                <span className="text-green-600">✔</span> Include approvals,
                attachments, and notes
              </li>
              <li>
                <span className="text-green-600">✔</span> Time-stamped activity
                logs for every transaction
              </li>
              <li>
                <span className="text-green-600">✔</span> Export in audit
                formats (PDF, CSV, XLSX)
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              Be audit-ready on demand—no panic, no paperwork scrambles.
            </p>
          </div>

          {/* Real-Time Statistics */}
          <div
            id="real-time-statistics"
            className="bg-white shadow-md rounded-xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Real-Time Statistics
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Make fast, data-driven decisions with real-time access to key
              financial metrics across your operations.
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <span className="text-green-600">✔</span> Live dashboards that
                auto-refresh with latest data
              </li>
              <li>
                <span className="text-green-600">✔</span> Monitor cash flow,
                expense trends, and balances instantly
              </li>
              <li>
                <span className="text-green-600">✔</span> Get alerted on
                threshold breaches or unusual activity
              </li>
              <li>
                <span className="text-green-600">✔</span> Customize which KPIs
                matter most to your team
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              Stay ahead of problems and seize opportunities—powered by live
              financial intelligence.
            </p>
          </div>
        </div>

        {/* Team Section */}
        {/* <div id="team" className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                John Doe
              </h3>
              <p className="text-blue-600 mb-2">CEO & Founder</p>
              <p className="text-gray-600">
                10+ years of experience in financial technology and business
                management.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Jane Smith
              </h3>
              <p className="text-blue-600 mb-2">CTO</p>
              <p className="text-gray-600">
                Expert in software architecture and financial systems
                development.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mike Johnson
              </h3>
              <p className="text-blue-600 mb-2">Head of Product</p>
              <p className="text-gray-600">
                Specialized in user experience and product strategy for
                financial tools.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </Layout>
  );
};

export default About;
