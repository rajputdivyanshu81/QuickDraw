"use client";

import React from "react";
import "./landing.css";

// Import landing components
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import BentoSection from "@/components/landing/BentoSection";
import HowSection from "@/components/landing/HowSection";
import ShipFastSection from "@/components/landing/ShipFastSection";
import AISection from "@/components/landing/AISection";
import OpenSourceSection from "@/components/landing/OpenSourceSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ScheduleSection from "@/components/landing/ScheduleSection";
import DocsSection from "@/components/landing/DocsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <BentoSection />
        <HowSection />
        <ShipFastSection />
        <AISection />
        <DocsSection />
        <OpenSourceSection />
        <TestimonialsSection />
        <ScheduleSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}