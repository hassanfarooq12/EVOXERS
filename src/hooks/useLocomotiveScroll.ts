import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';

/**
 * Custom hook to initialize and manage Locomotive Scroll
 * 
 * Features:
 * - Smooth scroll on desktop (60 FPS optimized)
 * - Native scroll on mobile/tablet for performance
 * - GPU-accelerated animations
 * - Auto cleanup on unmount
 * 
 * @returns scrollRef - Ref to attach to scroll container element
 */
export function useLocomotiveScroll() {
  // Ref for the scroll container element
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Ref to store Locomotive Scroll instance
  const locomotiveScrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    // Early return if container ref not available
    if (!scrollRef.current) return;

    // Small delay to ensure all DOM elements are fully rendered
    // This prevents issues with sections not being detected by Locomotive
    const initTimeout = setTimeout(() => {
      // Initialize Locomotive Scroll with performance-optimized settings
      locomotiveScrollRef.current = new LocomotiveScroll({
        el: scrollRef.current!,            // Target element for smooth scroll
        smooth: true,                       // Enable smooth scrolling on desktop
        multiplier: 1,                      // Scroll speed multiplier (1 = natural speed)
        lerp: 0.05,                        // Linear interpolation (0.05 = very smooth, lower = smoother but heavier)
        smartphone: {
          smooth: false,                    // CRITICAL: Disable smooth scroll on mobile - use native scroll
          breakpoint: 768,                  // Mobile breakpoint (<=768px)
        },
        tablet: {
          smooth: false,                    // CRITICAL: Disable smooth scroll on tablet - use native scroll  
          breakpoint: 1024,                 // Tablet breakpoint (<=1024px)
        },
        // GPU acceleration - force hardware acceleration for smooth 60 FPS
        class: 'is-inview',                // Class added to elements in viewport
        getDirection: true,                 // Track scroll direction
        getSpeed: true,                     // Track scroll speed
        reloadOnContextChange: true,        // Reload on window resize
      });

      // Force update after initialization to detect all sections
      // This ensures all data-scroll-section elements are properly registered
      setTimeout(() => {
        locomotiveScrollRef.current?.update();
      }, 100);
    }, 100);

    // Cleanup function - destroy instance on unmount and clear timeout
    return () => {
      clearTimeout(initTimeout);
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.destroy();
        locomotiveScrollRef.current = null;
      }
    };
  }, []);

  // Return the ref to be attached to scroll container
  return scrollRef;
}

