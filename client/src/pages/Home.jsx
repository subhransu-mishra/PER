import React from "react";
import Layout from "../components/Layout";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";

const Home = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <Testimonials />
    </Layout>
  );
};

export default Home;
