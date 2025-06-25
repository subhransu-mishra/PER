import React from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <Hero />
      <Features />
      <Testimonials />
      <Footer/>
    </div>
  );
};

export default Home;
