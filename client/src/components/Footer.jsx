import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-50 text-slate-600 px-6 py-12 border-t border-blue-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        
        {/* Section 1: Brand */}
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">PER System</h2>
          <p className="text-sm text-slate-500">
            Smart management of petty cash, expenses, and revenue — made simple.
          </p>
        </div>

        {/* Section 2: Quick Links */}
        <div className="text-center sm:text-left">
          <h3 className="text-md font-semibold text-blue-600 mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#home" className="hover:text-blue-500">Home</a></li>
            <li><a href="#features" className="hover:text-blue-500">Features</a></li>
            <li><a href="#pricing" className="hover:text-blue-500">Pricing</a></li>
            <li><a href="#faq" className="hover:text-blue-500">FAQs</a></li>
          </ul>
        </div>

        {/* Section 3: Support */}
        <div className="text-center sm:text-left">
          <h3 className="text-md font-semibold text-blue-600 mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>Email: <a href="mailto:support@per.com" className="text-blue-500 hover:underline">support@per.com</a></li>
            <li>Phone: <span className="text-slate-600">+91-9876543210</span></li>
            <li>Hours: Mon–Fri, 9AM–6PM</li>
          </ul>
        </div>

        {/* Section 4: Legal */}
        <div className="text-center sm:text-left">
          <h3 className="text-md font-semibold text-blue-600 mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#terms" className="hover:text-blue-500">Terms of Service</a></li>
            <li><a href="#privacy" className="hover:text-blue-500">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-10 border-t border-blue-100 pt-4 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} PER System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
