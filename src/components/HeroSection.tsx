import React from "react";
import { motion } from "motion/react";
import { FloatingDeviceMockup } from "./FloatingDeviceMockup";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface HeroSectionProps {
  imageUrl: string;
  onPortfolioClick: () => void;
}

export function HeroSection({ imageUrl, onPortfolioClick }: HeroSectionProps) {
  const titleWords = ["Digital", "Solutions", "That", "Convert"];

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-32">
      <div className="max-w-7xl mx-auto w-full">
        {/* Text Content */}
        <div className="text-center mb-16 space-y-6">

          {/* Main Heading with staggered animation + Locomotive parallax */}
          <div className="space-y-2">
            {/* Locomotive Scroll parallax attributes:
                - data-scroll: Enable scroll tracking
                - data-scroll-speed: 1.5 = subtle parallax (slower than normal scroll)
                - GPU-accelerated transform on desktop only
            */}
            <h1 
              className="text-6xl md:text-8xl tracking-tight"
              style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 700 }}
              data-scroll
              data-scroll-speed="1.5"
            >
              {titleWords.map((word, index) => (
                <motion.span
                  key={index}
                  className="inline-block mr-4 md:mr-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.4 + index * 0.08,
                  }}
                  style={{ willChange: "transform, opacity" }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </div>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            style={{ fontFamily: "'Aeonik', 'Arial', 'Helvetica', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Transform your business with cutting-edge web development, stunning graphic design, 
            AI-powered video creation, and high-converting social media campaigns.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                className="rounded-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] hover:shadow-lg hover:shadow-[var(--accent-blue)]/50 transition-shadow"
                onClick={onPortfolioClick}
              >
                View My Portfolio
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Our Services
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Device Mockup with reverse parallax for depth effect */}
        {/* Locomotive Scroll parallax attributes:
            - data-scroll: Enable scroll tracking
            - data-scroll-speed: -0.8 = reverse parallax (moves opposite direction)
            - Creates depth perception - floats slower than content
        */}
        <div
          data-scroll
          data-scroll-speed="-0.8"
        >
          <FloatingDeviceMockup imageUrl={imageUrl} title="showcase.design" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1.5,
          duration: 0.5,
        }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1 h-2 bg-muted-foreground rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
