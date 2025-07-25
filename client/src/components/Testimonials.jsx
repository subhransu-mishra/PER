// Testimonials.jsx
import React from "react";

const testimonials = [
  {
    name: "Anirudh Mehta",
    company: "QuantEdge Solutions",
    rating: 5,
    feedback:
      "PER has become an essential part of our internal operations. Tracking and managing petty cash flows is now seamless and audit-friendly.",
  },
  {
    name: "Priya Sharma",
    company: "BlueCore Enterprises",
    rating: 5,
    feedback:
      "The simplicity of PER is what makes it powerful. Our expense tracking across departments has improved dramatically.",
  },
  {
    name: "Rajeev Nair",
    company: "FinNest Technologies",
    rating: 5,
    feedback:
      "As a financial officer, PER gives me confidence in data accuracy and real-time availability. The ability to customize reports instantly is a game-changer.",
  },
  {
    name: "Sneha Das",
    company: "AxisCube Private Ltd.",
    rating: 5,
    feedback:
      "We've used PER for 3 months and already seen smoother approvals, faster reimbursements, and better visibility.",
  },
  {
    name: "Vikram Singh",
    company: "TechFlow Systems",
    rating: 5,
    feedback:
      "Outstanding platform! The automated expense tracking has saved us countless hours and improved our financial accuracy significantly.",
  },
  {
    name: "Meera Patel",
    company: "InnovateCorp",
    rating: 5,
    feedback:
      "I'm speechless about how well this works. The user interface is intuitive and the reporting features are exactly what we needed.",
  },
];

/* ----------  StarRating  ---------- */
const StarRating = ({ count }) => (
  <div className="flex gap-1 mb-3">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < count ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.24 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
      </svg>
    ))}
  </div>
);

/* ----------  TestimonialCard  ---------- */
const TestimonialCard = ({ testimonial }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 w-96 flex-shrink-0 mx-4 group hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-200">
    <div className="flex items-start mb-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold mr-5 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
        {testimonial.name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="font-bold text-gray-900 text-lg group-hover:text-blue-900 transition-colors duration-300">
          {testimonial.name}
        </div>
        <div className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors duration-300 font-medium">
          {testimonial.company}
        </div>
      </div>
    </div>

    <div className="mb-4">
      <StarRating count={testimonial.rating} />
    </div>

    <div className="relative">
      <svg
        className="absolute -top-2 -left-2 w-8 h-8 text-blue-100 group-hover:text-blue-200 transition-colors duration-300"
        fill="currentColor"
        viewBox="0 0 32 32"
      >
        <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-4c0-1.1.9-2 2-2V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-4c0-1.1.9-2 2-2V8z" />
      </svg>
      <p className="text-gray-700 text-base leading-relaxed pl-6 group-hover:text-gray-800 transition-colors duration-300 font-medium">
        "{testimonial.feedback}"
      </p>
    </div>

    {/* Decorative elements */}
    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-200 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-300 rounded-full opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
  </div>
);

/* ----------  Marquee Row  ---------- */
const MarqueeRow = ({ items, reverse = false }) => (
  <div className="relative flex overflow-hidden">
    <div
      className={`flex flex-shrink-0 ${
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      }`}
    >
      {items.map((t, i) => (
        <TestimonialCard key={`orig-${i}`} testimonial={t} />
      ))}
      {items.map((t, i) => (
        <TestimonialCard key={`clone-${i}`} testimonial={t} />
      ))}
    </div>
  </div>
);

/* ----------  Page Section  ---------- */
const Testimonials = () => (
  <section className="bg-gradient-to-b from-gray-50 to-white py-24 px-4 overflow-hidden">
    <div className="max-w-7xl mx-auto text-center mb-20">
      <div className="inline-block mb-4">
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
          Customer Reviews
        </span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
        What our customers are saying
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Join thousands of businesses that trust our platform to streamline their
        financial operations and boost productivity
      </p>
    </div>

    <div className="relative">
      <MarqueeRow items={testimonials} />
      <div className="mt-10">
        <MarqueeRow items={testimonials} reverse />
      </div>

      {/* Enhanced Fade edges */}
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-gray-50 via-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-gray-50 via-white to-transparent pointer-events-none z-10" />
    </div>

    <style jsx>{`
      @keyframes marquee {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      @keyframes marquee-reverse {
        0% {
          transform: translateX(-50%);
        }
        100% {
          transform: translateX(0%);
        }
      }
      .animate-marquee {
        animation: marquee 70s linear infinite;
      }
      .animate-marquee-reverse {
        animation: marquee-reverse 70s linear infinite;
      }
    `}</style>
  </section>
);

export default Testimonials;
