import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const testimonials = [
  {
    name: "Anirudh Mehta",
    company: "QuantEdge Solutions",
    rating: 5,
    feedback:
      "PER has become an essential part of our internal operations. Tracking and managing petty cash flows is now seamless and audit-friendly. The interface is intuitive, and the automation saves a lot of manual effort.",
  },
  {
    name: "Priya Sharma",
    company: "BlueCore Enterprises",
    rating: 4,
    feedback:
      "The simplicity of PER is what makes it powerful. Our expense tracking across departments has improved dramatically. It's exactly what we needed for clarity and compliance.",
  },
  {
    name: "Rajeev Nair",
    company: "FinNest Technologies",
    rating: 5,
    feedback:
      "As a financial officer, PER gives me confidence in data accuracy and real-time availability. The ability to customize reports and access expense logs instantly is a game-changer.",
  },
  {
    name: "Sneha Das",
    company: "AxisCube Private Ltd.",
    rating: 5,
    feedback:
      "We've used PER for 3 months and already seen smoother approvals, faster reimbursements, and better visibility. Their support team is also very responsive and knowledgeable.",
  },
];

const StarRating = ({ count }) => (
  <div className="flex gap-1 mb-2">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < count ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-20 px-4 text-gray-700">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-blue-800 mb-4">
          Real Voices. Real Impact.
        </h2>
        <p className="text-lg text-blue-600 mb-12">
          Hear what professionals say about the PER experience.
        </p>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={40}
          slidesPerView={1}
          navigation
          autoplay={{ delay: 5000 }}
          loop={true}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 2 },
          }}
        >
          {testimonials.map((t, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-8 max-w-xl mx-auto text-left hover:shadow-xl transition duration-300">
                <p className="italic text-gray-600 mb-5">“{t.feedback}”</p>
                <div className="font-semibold text-blue-900 text-lg">{t.name}</div>
                <div className="text-sm text-blue-500 mb-1">{t.company}</div>
                <StarRating count={t.rating} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
