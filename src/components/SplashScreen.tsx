import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import logoLogin from "../assets/images/logo-login.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash screen for minimum time (reduced from 2s to 0.8s for faster load)
    // Also check if page is already loaded
    const handleComplete = () => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 300); // Reduced animation delay
    };
    
    // If already loaded, skip delay
    if (document.readyState === 'complete') {
      handleComplete();
      return;
    }
    
    // Wait for minimum time (reduced from 2000ms to 800ms) or page load
    const timer = setTimeout(() => {
      handleComplete();
    }, 800);
    
    const handleLoad = () => {
      if (document.readyState === 'complete') {
        clearTimeout(timer);
        handleComplete();
      }
    };
    
    window.addEventListener('load', handleLoad);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-background flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Logo Image Container */}
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: "-100vh",
              opacity: 0,
              transition: {
                duration: 0.8, // Reduced from 1.5s to 0.8s for faster animation
                ease: [0.22, 1, 0.36, 1], // Smooth easing like curtains opening
              },
            }}
          >
            {/* Curtain Effect - Top Curtain */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-1/2 bg-background z-10"
              initial={{ y: 0 }}
              exit={{
                y: "-100%",
                transition: {
                  duration: 0.8, // Reduced from 1.5s to 0.8s
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.05, // Reduced delay
                },
              }}
            />

            {/* Logo Image */}
            <motion.img
              src={logoLogin}
              alt="EVOXERS Logo"
              className="relative z-20 max-w-[200px] md:max-w-[280px] lg:max-w-[320px] w-auto h-auto object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            />

            {/* Curtain Effect - Bottom Curtain */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1/2 bg-background z-10"
              initial={{ y: 0 }}
              exit={{
                y: "100%",
                transition: {
                  duration: 0.8, // Reduced from 1.5s to 0.8s
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.05, // Reduced delay
                },
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
