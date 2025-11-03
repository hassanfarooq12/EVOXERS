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
export function useLocomotiveScroll(enabled: boolean = true) {
  // Ref for the scroll container element
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Ref to store Locomotive Scroll instance
  const locomotiveScrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    // Early return if disabled
    if (!enabled) return;
    // Early return if container ref not available
    if (!scrollRef.current) return;

    // Small delay to ensure all DOM elements are fully rendered
    // This prevents issues with sections not being detected by Locomotive
    const initTimeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const smoothParam = params.get('smooth');
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Default: smooth ON, unless ?smooth=0/false or reduced-motion
      const disallowSmooth = smoothParam === '0' || smoothParam === 'false' || prefersReducedMotion;
      if (disallowSmooth) return;

      // Initialize Locomotive Scroll with luxury-smooth settings
      locomotiveScrollRef.current = new LocomotiveScroll({
        el: scrollRef.current!,
        smooth: true,
        // Slightly higher multiplier for premium inertia feel
        multiplier: 1.25,
        // Lower lerp = smoother interpolation
        lerp: 0.075,
        smartphone: {
          smooth: true,
          breakpoint: 768,
        },
        tablet: {
          smooth: true,
          breakpoint: 1024,
        },
        class: 'is-inview',
        getDirection: true,
        getSpeed: true,
        reloadOnContextChange: true,
      });

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
  }, [enabled]);

  // Return the ref to be attached to scroll container
  return scrollRef;
}

