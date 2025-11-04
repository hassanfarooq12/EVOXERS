import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import logoLogin from "../assets/images/logo-login.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash screen for minimum time (1.5 seconds) to ensure it's visible
    // This ensures splash screen shows on every fresh page load and refresh
    const handleComplete = () => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 300); // Animation delay
    };
    
    // Minimum time to show splash screen (1.5 seconds)
    // This ensures it's visible even if page loads quickly
    const minDisplayTime = 1500;
    const startTime = Date.now();
    
    // Wait for page load AND minimum display time
    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      setTimeout(() => {
        handleComplete();
      }, remaining);
    };
    
    // If page is already loaded, still wait for minimum time
    if (document.readyState === 'complete') {
      setTimeout(() => {
        handleComplete();
      }, minDisplayTime);
    } else {
      // Wait for page load, but ensure minimum display time
      window.addEventListener('load', handleLoad);
      
      // Fallback: if page takes too long, show for minimum time anyway
      setTimeout(() => {
        handleComplete();
      }, minDisplayTime + 500);
    }
    
    return () => {
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
              loading="eager"
              fetchPriority="high"
              decoding="sync"
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
