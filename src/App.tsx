import React, { useState, useEffect, useCallback } from "react";
import { DynamicBackground } from "./components/DynamicBackground";
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { ShowcaseSection } from "./components/ShowcaseSection";
import { FeatureCards } from "./components/FeatureCards";
import { Portfolio } from "./components/Portfolio";
import { Footer } from "./components/Footer";
import { Watermark } from "./components/Watermark";
import { SplashScreen } from "./components/SplashScreen";
import { Code2, Palette, Video, Target } from "lucide-react";
// Import Locomotive Scroll hook for smooth scroll initialization
import { useLocomotiveScroll } from "./hooks/useLocomotiveScroll";
// Import images properly for Vite
import graphicDesignWpap3 from "./assets/images/graphic-design-wpap-3.jpg";
import graphicDesignWpap from "./assets/images/graphic-design-wpap.jpg";
import graphicDesignWpap2 from "./assets/images/graphic-design-wpap-2.jpg";
import graphicDesignWpap4 from "./assets/images/graphic-design-wpap-4.jpeg";

export default function App() {
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  // Start with content hidden so splash screen shows properly
  const [showMainContent, setShowMainContent] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname || "/";
  });
  const [currentHash, setCurrentHash] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.location.hash || "";
  });
  
  // Determine if we're on home and enable Locomotive accordingly
  const isHome = currentPath === "/" || currentPath === "";
  // Initialize Locomotive Scroll only when on home route and content is ready
  // Pass showMainContent to ensure Locomotive initializes AFTER content is visible
  const { scrollRef, scrollTo } = useLocomotiveScroll(isHome, showMainContent);

  useEffect(() => {
    // Force dark mode - always apply dark class
    document.documentElement.classList.add("dark");
    const params = new URLSearchParams(window.location.search);
    const effectsParam = params.get('effects');
    // Default: effects ON, unless ?effects=0/false or reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const disableEffects = effectsParam === '0' || effectsParam === 'false' || prefersReducedMotion;
    setEffectsEnabled(!disableEffects);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setShowMainContent(true);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
      setCurrentHash(window.location.hash || "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = useCallback((path: string, hash: string = "") => {
    const normalizedPath = path || "/";
    const normalizedHash = hash || "";
    const fullPath = normalizedHash ? `${normalizedPath}${normalizedHash}` : normalizedPath;

    // Update state first to trigger re-render immediately
    setCurrentPath(normalizedPath);
    setCurrentHash(normalizedHash);

    // Then update URL
    if (window.location.pathname !== normalizedPath || window.location.hash !== normalizedHash) {
      window.history.pushState({}, "", fullPath);
    }

    // Force immediate scroll to top for portfolio route
    if (normalizedPath === "/portfolio") {
      window.scrollTo({ top: 0, behavior: "auto" });
      // Also ensure DOM is ready and scroll again after a brief delay
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, []);

  const scrollToSection = useCallback(
    (hash: string) => {
      if (!hash) return;
      const id = hash.replace("#", "");
      const target = document.getElementById(id);
      if (!target) return;
      scrollTo(target, { offset: 0, duration: 900 });
    },
    [scrollTo]
  );

  useEffect(() => {
    if (!showMainContent) return;

    if (currentPath === "/") {
      if (currentHash) {
        // Scroll to section when hash is present (e.g., clicking Contact button)
        requestAnimationFrame(() => scrollToSection(currentHash));
        setTimeout(() => scrollToSection(currentHash), 150);
      } else {
        // No hash, ensure we're at top (e.g., after home button reload)
        window.scrollTo({ top: 0, behavior: "auto" });
        // Clear any hash from URL if present
        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    } else if (currentPath === "/portfolio") {
      // When navigating to portfolio page, ensure immediate scroll to top
      // Multiple attempts to ensure it works on all devices
      window.scrollTo({ top: 0, behavior: "auto" });
      
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Also try to scroll to portfolio section if hash exists
      if (currentHash) {
        const doScroll = () => scrollToSection(currentHash);
        setTimeout(doScroll, 80);
        setTimeout(doScroll, 200);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [currentPath, currentHash, showMainContent, scrollToSection]);

  // isHome is computed above

  return (
    <>
      {/* Splash Screen - Shows first, then animates upward */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Main Content - Hidden until splash screen completes */}
      {showMainContent && (
        <>
          <DynamicBackground />

          {/* Fixed Navigation - stays at top, not affected by smooth scroll */}
          <Navigation onNavigate={handleNavigate} />

      {/* 
        Locomotive Scroll Container - enables smooth scroll on desktop
        - id="smooth-wrapper": Unique identifier for scroll wrapper
        - data-scroll-container: Required by Locomotive Scroll to identify scroll container
        - scrollRef: Connected to useLocomotiveScroll hook for initialization
        - Mobile/tablet: Falls back to native scroll automatically (<=1024px)
        
        IMPORTANT: Each component inside must have its own data-scroll-section
        to ensure Locomotive Scroll properly detects and renders all content
      */}
      <div
        id="smooth-wrapper"
        key={currentPath}
        ref={isHome ? scrollRef : undefined}
        {...(isHome ? { "data-scroll-container": true } : {})}
        className="relative min-h-screen"
      >
        
        {isHome ? (
          <>
        <div data-scroll-section id="hero">
              <HeroSection 
                imageUrl="https://images.unsplash.com/photo-1688387786635-fc9922bc6e38?crop=entropy&cs=tinysrgb&fit=max&fm=webp&q=85&w=1920"
                onPortfolioClick={() => handleNavigate("/portfolio")}
                enableEffects={effectsEnabled}
              />
            </div>

            <div data-scroll-section id="services">
              <FeatureCards />
            </div>

            <div data-scroll-section>
              <ShowcaseSection
                title="Modern Web Development"
                description="Building responsive, fast, and SEO-optimized websites that convert visitors into customers. From simple landing pages to complex web applications, I create digital experiences that drive business growth."
                imageUrl={graphicDesignWpap3}
                tags={["React & Next.js", "Responsive Design", "SEO Optimization", "Performance"]}
                icon={Code2}
                id="showcase-web"
                lazyLoad={false}
              />
            </div>

            <div data-scroll-section>
              <ShowcaseSection
                title="Professional Graphic Design"
                description="Creating stunning visual identities that make your brand stand out. Complete design solutions including logos, marketing materials, and social media graphics that capture attention and drive engagement."
                imageUrl={graphicDesignWpap}
                tags={["Brand Identity", "Logo Design", "Marketing Materials", "Social Media"]}
                icon={Palette}
                reversed
                id="showcase-design"
                lazyLoad={true}
              />
            </div>

            <div data-scroll-section>
              <ShowcaseSection
                title="AI-Powered Video Creation"
                description="Revolutionary video creation technology that generates engaging content with automatic subtitles, voiceovers, and dynamic animations. Perfect for social media marketing and content creation at scale."
                imageUrl={graphicDesignWpap2}
                tags={["AI Video Generation", "Automatic Subtitles", "Voice Synthesis", "Social Media"]}
                icon={Video}
                id="showcase-video"
                lazyLoad={true}
              />
            </div>

            <div data-scroll-section>
              <ShowcaseSection
                title="High-Converting Ad Campaigns"
                description="Data-driven Facebook and Instagram ad campaigns that generate qualified leads and maximize ROI. Complete campaign management from strategy development to optimization and performance tracking."
                imageUrl={graphicDesignWpap4}
                tags={["Facebook Ads", "Instagram Ads", "Campaign Strategy", "ROI Optimization"]}
                icon={Target}
                reversed
                id="showcase-ads"
                lazyLoad={true}
              />
            </div>

            <div data-scroll-section id="contact">
              <Footer onNavigate={handleNavigate} />
            </div>

            <div data-scroll-section>
              <Watermark />
            </div>
          </>
        ) : (
          <>
            <div>
              <Portfolio />
            </div>

            <div id="contact">
              <Footer onNavigate={handleNavigate} />
            </div>

            <div>
              <Watermark />
            </div>
          </>
        )}
      </div>
        </>
      )}
    </>
  );
}
