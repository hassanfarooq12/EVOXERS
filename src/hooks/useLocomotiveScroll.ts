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
 * - Waits for content to be ready before initializing
 * 
 * @param enabled - Whether Locomotive Scroll should be enabled
 * @param contentReady - Whether the content is ready to be displayed (e.g., after splash screen)
 * @returns scrollRef - Ref to attach to scroll container element
 */
export function useLocomotiveScroll(enabled: boolean = true, contentReady: boolean = true) {
  // Ref for the scroll container element
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Ref to store Locomotive Scroll instance
  const locomotiveScrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    // Early return if disabled or content not ready
    if (!enabled || !contentReady) return;
    // Early return if container ref not available
    if (!scrollRef.current) return;

    // Destroy existing instance if any (in case of re-initialization)
    if (locomotiveScrollRef.current) {
      locomotiveScrollRef.current.destroy();
      locomotiveScrollRef.current = null;
    }

    const params = new URLSearchParams(window.location.search);
    const smoothParam = params.get('smooth');
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Default: smooth ON, unless ?smooth=0/false or reduced-motion
    const disallowSmooth = smoothParam === '0' || smoothParam === 'false' || prefersReducedMotion;
    if (disallowSmooth) return;

    // Wait for container to be in DOM and all sections to be rendered
    let retryCount = 0;
    const maxRetries = 10; // Maximum retries to prevent infinite loop
    
    const checkAndInitialize = () => {
      if (!scrollRef.current || !scrollRef.current.isConnected) {
        retryCount++;
        if (retryCount < maxRetries) {
          // Retry if not connected yet
          requestAnimationFrame(checkAndInitialize);
        }
        return null;
      }

      // Small delay to ensure all DOM elements are fully rendered
      // This prevents issues with sections not being detected by Locomotive
      const initTimeout = setTimeout(() => {
        if (!scrollRef.current || locomotiveScrollRef.current) return;

        // Initialize Locomotive Scroll with luxury-smooth settings
        locomotiveScrollRef.current = new LocomotiveScroll({
          el: scrollRef.current,
          smooth: true, // desktop only
          // Balanced multiplier to avoid jank
          multiplier: 1.0,
          // Smoothing factor
          lerp: 0.1,
          smartphone: {
            smooth: false, // use native scroll on phones
            breakpoint: 768,
          },
          tablet: {
            smooth: false, // use native scroll on tablets
            breakpoint: 1024,
          },
          class: 'is-inview',
          getDirection: true,
          getSpeed: true,
          reloadOnContextChange: true,
        });

        // Force multiple updates to ensure all sections are detected
        // This is critical for initial page load when parallax effects need to work immediately
        const updateLocomotive = () => {
          if (locomotiveScrollRef.current) {
            locomotiveScrollRef.current.update();
          }
        };

        // Trigger scroll event on the container to wake up Locomotive Scroll
        const triggerScrollEvent = () => {
          if (scrollRef.current) {
            // Dispatch a scroll event on the container to trigger Locomotive Scroll calculations
            const scrollEvent = new Event('scroll', { bubbles: true });
            scrollRef.current.dispatchEvent(scrollEvent);
          }
        };

        // Update immediately on next frame
        requestAnimationFrame(() => {
          updateLocomotive();
          triggerScrollEvent();
        });
        
        // Update after delays to catch any late-rendering sections
        setTimeout(() => {
          updateLocomotive();
          triggerScrollEvent();
        }, 100);
        setTimeout(() => {
          updateLocomotive();
          triggerScrollEvent();
        }, 300);
        setTimeout(() => {
          updateLocomotive();
          triggerScrollEvent();
        }, 500);
        
        // Final update after all animations/transitions complete
        setTimeout(() => {
          updateLocomotive();
          triggerScrollEvent();
        }, 1000);
      }, 150);

      return initTimeout;
    };

    const initTimeout = checkAndInitialize();

    // Cleanup function - destroy instance on unmount and clear timeout
    return () => {
      if (initTimeout) clearTimeout(initTimeout);
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.destroy();
        locomotiveScrollRef.current = null;
      }
    };
  }, [enabled, contentReady]);

  // Return the ref to be attached to scroll container
  return scrollRef;
}

