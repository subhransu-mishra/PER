import React, { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { Check } from "lucide-react";

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


const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: isAnnual ? 499 : 39,
      period: isAnnual ? "year" : "month",
      description:
        "Perfect for small teams getting started with financial management",
      features: [
        "Up to 5 users",
        "Basic petty cash management",
        "Expense tracking",
        "Basic reporting",
        "Email support",
        "Mobile app access",
      ],
      popular: false,
      color: "blue",
    },
    {
      name: "Professional",
      price: isAnnual ? 999 : 99,
      period: isAnnual ? "year" : "month",
      description: "Ideal for growing businesses that need advanced features",
      features: [
        "Up to 25 users",
        "Advanced petty cash management",
        "Expense tracking & categorization",
        "Advanced reporting & analytics",
        "Priority email support",
        "Mobile app access",
        "API access",
        "Custom integrations",
      ],
      popular: true,
      color: "purple",
    },
    {
      name: "Enterprise",
      price: isAnnual ? 1499 : 249,
      period: isAnnual ? "year" : "month",
      description: "For large organizations with complex financial needs",
      features: [
        "Unlimited users",
        "Complete financial management suite",
        "Advanced expense tracking",
        "Custom reporting & dashboards",
        "24/7 phone & email support",
        "Mobile app access",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "On-premise deployment option",
      ],
      popular: false,
      color: "indigo",
    },
  ];

  // const getColorClasses = (color) => {
  //   const colors = {
  //     blue: "border-blue-200 bg-blue-50",
  //     purple: "border-purple-200 bg-purple-50",
  //     indigo: "border-indigo-200 bg-indigo-50",
  //   };
  //   return colors[color] || colors.blue;
  // };

  const getButtonClasses = (color, popular) => {
    const baseClasses =
      "w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200";
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700 text-white",
      purple: "bg-purple-600 hover:bg-purple-700 text-white",
      indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
    };
    const colorClass = colors[color] || colors.blue;
    const popularClass = popular ? "ring-2 ring-purple-500 ring-offset-2" : "";
    return `${baseClasses} ${colorClass} ${popularClass}`;
  };

  // Animations: fade/slide-in for hero and each card
  const [heroRef, heroVisible] = useRevealOnScroll();
  const cardRefs = plans.map(() => useRevealOnScroll());

  return (
    <Layout>
      <div className="bg-gradient-to-b from-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div
          ref={heroRef}
          className={`max-w-7xl mx-auto text-center mb-16 transition-all duration-1000 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl lg:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500">
            Choose the perfect plan for your organization. All plans include our
            core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <span
              className={`text-sm font-medium ${
                !isAnnual ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                isAnnual ? "bg-purple-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                isAnnual ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Annual
            </span>
            {isAnnual && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Save 25%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
  const [ref, visible] = cardRefs[index];
  return (
    <div
      ref={ref}
      key={index}
      className={`relative rounded-2xl border-2 p-8 transition-all duration-1000 ease-out transform ${plan.popular ? "border-purple-500 bg-white shadow-xl scale-105" : "border-gray-200 bg-white shadow-lg"} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} hover:scale-105 hover:shadow-2xl`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-600 text-white">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-6">{plan.description}</p>
        <div className="mb-8">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
            <span className="text-gray-500 ml-1">/{plan.period}</span>
          </div>
          {isAnnual && (
            <p className="text-sm text-gray-500 mt-1">Billed annually</p>
          )}
        </div>
        <ul className="space-y-4 mb-8 text-left">
          {plan.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <button
          className={getButtonClasses(plan.color, plan.popular)}
        >
          Get Started
        </button>
      </div>
    </div>
  );
})}

          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial available?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 14-day free trial for all plans. No credit card
                required to start your trial.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and bank
                transfers. All payments are processed securely.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer custom pricing for large organizations?
              </h3>
              <p className="text-gray-600">
                Yes, we offer custom pricing for enterprise customers with
                specific requirements. Contact our sales team for more
                information.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 sm:p-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Join thousands of organizations that trust PER System for their
              financial management needs.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg">
                Start Free Trial
              </button>
              <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 bg-opacity-60 hover:bg-opacity-70 transform hover:scale-105 transition-all duration-200 shadow-lg">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
