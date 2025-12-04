import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import logoLogin from "../assets/images/logo-login.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Ensure logo is cached immediately
    const img = new Image();
    img.src = logoLogin;

    // Premium smooth splash screen with elegant timing
    const handleComplete = () => {
      setIsVisible(false);
      // Small delay to ensure exit animation completes smoothly
      setTimeout(() => {
        onComplete();
      }, 200);
    };
    
    // Premium timing: Logo appears, stays visible, then curtain reveals smoothly
    // Total time: ~2.5-3 seconds for premium feel
    const logoFadeInTime = 800; // Logo fade-in duration
    const logoDisplayTime = 1500; // Time logo stays fully visible
    const curtainAnimationTime = 1200; // Curtain reveal duration
    const minDisplayTime = logoFadeInTime + logoDisplayTime + curtainAnimationTime; // ~3.5 seconds total
    
    const startTime = Date.now();
    
    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      setTimeout(() => {
        handleComplete();
      }, remaining);
    };
    
    // If page is already loaded (from cache), still show with premium timing
    if (document.readyState === 'complete') {
      setTimeout(() => {
        handleComplete();
      }, minDisplayTime);
    } else {
      // Wait for load, then respect minimum display time
      window.addEventListener('load', handleLoad);
      
      // Fallback guard (network stalls): ensure it doesn't hang
      setTimeout(() => {
        handleComplete();
      }, minDisplayTime + 1500);
    }
    
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [onComplete]);

  return (
    <>
      {/* Mobile-specific styles - only applied on mobile devices */}
      <style>{`
        /* Mobile splash screen - full viewport height */
        @media (max-width: 767px) {
          .evox-splash-screen {
            height: 100vh !important;
            height: 100dvh !important; /* Dynamic viewport height for mobile */
            min-height: 100vh !important;
            min-height: 100dvh !important;
          }
          
          .evox-splash-container {
            height: 100vh !important;
            height: 100dvh !important;
            min-height: 100vh !important;
            min-height: 100dvh !important;
          }
          
          .evox-splash-logo {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100vh !important;
            max-height: 100dvh !important;
            object-fit: cover !important;
            object-position: center center !important;
            -webkit-object-fit: cover !important;
            -webkit-object-position: center center !important;
          }
        }
        
        /* Desktop - keep original styling (unchanged) */
        @media (min-width: 768px) {
          .evox-splash-logo {
            /* Desktop styles remain unchanged - max-w-[200px] md:max-w-[280px] lg:max-w-[320px] */
          }
        }
      `}</style>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-background flex items-center justify-center evox-splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Logo Image Container */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center evox-splash-container"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{
                y: "-100vh",
                opacity: 0,
                transition: {
                  duration: 1.2, // Premium smooth curtain reveal
                  ease: [0.4, 0, 0.2, 1], // Smooth ease-in-out for premium feel
                  delay: 2.3, // Start after logo has been displayed
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
                    duration: 1.2, // Premium smooth curtain animation
                    ease: [0.4, 0, 0.2, 1], // Smooth cubic-bezier for elegant motion
                    delay: 2.3, // Start curtain after logo display time
                  },
                }}
              />

              {/* Logo Image */}
              <motion.img
                src={logoLogin}
                alt="EVOXERS Logo"
                className="relative z-20 max-w-[200px] md:max-w-[280px] lg:max-w-[320px] w-auto h-auto object-contain evox-splash-logo"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: {
                    duration: 0.8, // Smooth fade-in
                    ease: [0.4, 0, 0.2, 1], // Premium easing
                    delay: 0.2, // Small delay for elegant appearance
                  }
                }}
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
                    duration: 1.2, // Premium smooth curtain animation
                    ease: [0.4, 0, 0.2, 1], // Smooth cubic-bezier for elegant motion
                    delay: 2.3, // Start curtain after logo display time
                  },
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
