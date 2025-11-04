import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import logoLogin from "../assets/images/logo-login.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // INSTANT RELOAD - Minimal delay for smooth transition
    const handleComplete = () => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 150); // Reduced animation delay
    };
    
    // Ultra fast minimum time (200ms) - just enough to show logo
    const minDisplayTime = 200;
    const startTime = Date.now();
    
    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      setTimeout(() => {
        handleComplete();
      }, remaining);
    };
    
    // If page is already loaded (from cache), show splash very briefly
    if (document.readyState === 'complete') {
      setTimeout(() => {
        handleComplete();
      }, minDisplayTime);
    } else {
      // Wait for page load, but minimal delay
      window.addEventListener('load', handleLoad);
      
      // Fallback: if page takes too long, show for minimal time anyway
      setTimeout(() => {
        handleComplete();
      }, minDisplayTime + 100);
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
          transition={{ duration: 0.15 }}
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
                duration: 0.3, // Ultra fast animation for instant reload
                ease: [0.22, 1, 0.36, 1],
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
                  duration: 0.3, // Ultra fast
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0,
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
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
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
                  duration: 0.3, // Ultra fast
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0,
                },
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
