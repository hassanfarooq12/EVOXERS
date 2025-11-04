import React from "react";
import { motion } from "motion/react";
import { FloatingDeviceMockup } from "./FloatingDeviceMockup";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import LightRays from "./LightRays";

interface HeroSectionProps {
  imageUrl: string;
  onPortfolioClick?: () => void; // optional custom action for Join button
  onSeeFutureClick?: () => void; // optional custom action for See button
  enableEffects?: boolean;
}

export function HeroSection({ imageUrl, onPortfolioClick, onSeeFutureClick, enableEffects = false }: HeroSectionProps) {
  const titleWords = ["Be", "The", "Future", "Be", "An", "EVOXER"];
  
  const handleJoin = () => {
    if (typeof onPortfolioClick === 'function') {
      onPortfolioClick();
      return;
    }
    const subject = encodeURIComponent('I want to join the revolution');
    const body = encodeURIComponent("Hi EVOXERS team,\n\nI'm interested in transforming my digital presence. Let's talk!\n\n—");
    window.location.href = `mailto:hello@evoxers.com?subject=${subject}&body=${body}`;
  };

  const handleSeeFuture = () => {
    if (typeof onSeeFutureClick === 'function') {
      onSeeFutureClick();
      return;
    }
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-6 py-32 overflow-hidden">
      {/* Interactive Light Rays Effect */}
      {enableEffects && (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#8E1616"
            secondaryColor="#D84040"
            tertiaryColor="#EEEEEE"
            raysSpeed={1.5}
            lightSpread={0.7}
            rayLength={1.3}
            followMouse={true}
            mouseInfluence={0.12}
            noiseAmount={0.08}
            distortion={0.06}
            className="custom-rays"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Text Content */}
        <div className="text-center space-y-6 max-w-5xl mx-auto px-4">

          {/* Main Heading with staggered animation + Locomotive parallax */}
          <div className="space-y-4">
            {/* Locomotive Scroll parallax attributes:
                - data-scroll: Enable scroll tracking
                - data-scroll-speed: 1.5 = subtle parallax (slower than normal scroll)
                - GPU-accelerated transform on desktop only
            */}
            <h1 
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-center leading-none tracking-tight uppercase"
              style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 900 }}
              data-scroll
              data-scroll-speed="2.0"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="space-y-2"
              >
                <div className="text-white">
                  <span className="bg-gradient-to-r from-[#8E1616] to-[#D84040] bg-clip-text text-transparent">BE</span>{" "}
                  <span className="text-white">THE FUTURE</span>
                </div>
                <div className="text-white">
                  <span className="bg-gradient-to-r from-[#8E1616] to-[#D84040] bg-clip-text text-transparent">BE</span>{" "}
                  <span className="bg-gradient-to-r from-[#8E1616] to-[#D84040] bg-clip-text text-transparent font-black">AN EVOXER</span>
                </div>
              </motion.div>
            </h1>
          </div>

          {/* Clean Subtitle */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            data-scroll
            data-scroll-speed="0.6"
          >
            <p
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto text-center leading-relaxed"
              style={{ fontFamily: "'Aeonik', 'Arial', 'Helvetica', sans-serif" }}
            >
              We don't just build websites – we architect{" "}
              <span className="text-white font-semibold">digital revolutions</span> that transform businesses into industry leaders.
            </p>
            <p
              className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto text-center leading-relaxed"
              style={{ fontFamily: "'Aeonik', 'Arial', 'Helvetica', sans-serif" }}
            >
              From AI-powered web experiences to viral social campaigns, EVOXERS delivers the{" "}
              <span className="text-[#D84040] font-semibold">future of digital marketing</span> – today.
            </p>
          </motion.div>

          {/* Clean CTA Buttons */}
          <motion.div
            className="flex flex-row flex-wrap items-center justify-center gap-4 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            data-scroll
            data-scroll-speed="0.9"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                className=""
                onClick={handleJoin}
              >
                Join The Revolution
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                variant="outline"
                className=""
                onClick={handleSeeFuture}
              >
                See The Future
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Device Mockup with reverse parallax for depth effect - COMMENTED OUT */}
        {/* Locomotive Scroll parallax attributes:
            - data-scroll: Enable scroll tracking
            - data-scroll-speed: -0.8 = reverse parallax (moves opposite direction)
            - Creates depth perception - floats slower than content
        */}
        {/* 
        <div
          data-scroll
          data-scroll-speed="-0.8"
        >
          <FloatingDeviceMockup imageUrl={imageUrl} title="showcase.design" />
        </div>
        */}
      </div>

      <style>{`
/* From Uiverse.io by mrhyddenn */
#hero button[data-slot="button"] {
  position: relative;
  padding: 10px 20px;
  border-radius: 7px;
  border: 2px solid;
  border-image: linear-gradient(90deg, #8E1616 0%, #EEEEEE 100%) 1;
  background: transparent;
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 2px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 0 0 0 transparent;
  -webkit-transition: all 0.2s ease-in;
  -moz-transition: all 0.2s ease-in;
  transition: all 0.2s ease-in;
}

#hero button[data-slot="button"]:hover {
  background: transparent;
  box-shadow: 0 0 30px 5px rgba(142, 22, 22, 0.6);
  -webkit-transition: all 0.2s ease-out;
  -moz-transition: all 0.2s ease-out;
  transition: all 0.2s ease-out;
}

#hero button[data-slot="button"]:hover::before {
  -webkit-animation: sh02 0.5s 0s linear;
  -moz-animation: sh02 0.5s 0s linear;
  animation: sh02 0.5s 0s linear;
}

#hero button[data-slot="button"]::before {
  content: '';
  display: block;
  width: 0px;
  height: 86%;
  position: absolute;
  top: 7%;
  left: 0%;
  opacity: 0;
  background: #fff;
  box-shadow: 0 0 50px 30px #fff;
  -webkit-transform: skewX(-20deg);
  -moz-transform: skewX(-20deg);
  -ms-transform: skewX(-20deg);
  -o-transform: skewX(-20deg);
  transform: skewX(-20deg);
}

@keyframes sh02 {
  from {
    opacity: 0;
    left: 0%;
  }

  50% {
    opacity: 1;
  }

  to {
    opacity: 0;
    left: 100%;
  }
}

#hero button[data-slot="button"]:active {
  box-shadow: 0 0 0 0 transparent;
  -webkit-transition: box-shadow 0.2s ease-in;
  -moz-transition: box-shadow 0.2s ease-in;
  transition: box-shadow 0.2s ease-in;
}
      `}</style>
    </section>
  );
}
