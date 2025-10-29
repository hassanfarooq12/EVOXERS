import { useState, useEffect } from "react";
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

export default function App() {
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);
  
  // Initialize Locomotive Scroll - returns ref for scroll container
  // This enables smooth scroll on desktop, native scroll on mobile/tablet
  const scrollRef = useLocomotiveScroll();

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

  const openPortfolio = () => {
    setIsPortfolioOpen(true);
  };

  return (
    <>
      {/* Splash Screen - Shows first, then animates upward */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Main Content - Hidden until splash screen completes */}
      {showMainContent && (
        <>
          {/* Fixed Background - stays in place, not affected by smooth scroll */}
          <DynamicBackground />

          {/* Fixed Navigation - stays at top, not affected by smooth scroll */}
          <Navigation onPortfolioClick={openPortfolio} />

      {/* 
        Locomotive Scroll Container - enables smooth scroll on desktop
        - id="smooth-wrapper": Unique identifier for scroll wrapper
        - data-scroll-container: Required by Locomotive Scroll to identify scroll container
        - scrollRef: Connected to useLocomotiveScroll hook for initialization
        - Mobile/tablet: Falls back to native scroll automatically (<=1024px)
        
        IMPORTANT: Each component inside must have its own data-scroll-section
        to ensure Locomotive Scroll properly detects and renders all content
      */}
      <div id="smooth-wrapper" ref={scrollRef} data-scroll-container className="relative min-h-screen">
        
        {/* 
          SECTION 1: Hero Section 
          - data-scroll-section: Required for Locomotive to recognize this section
          - Contains: Hero title, subtitle, CTA buttons, device mockup
        */}
        <div data-scroll-section>
          <HeroSection 
            imageUrl="https://images.unsplash.com/photo-1688387786635-fc9922bc6e38?crop=entropy&cs=tinysrgb&fit=max&fm=webp&q=85&w=1920"
            onPortfolioClick={openPortfolio}
            enableEffects={effectsEnabled}
          />
        </div>

        {/* 
          SECTION 2: Services / Feature Cards
          - data-scroll-section: Separate section for service cards
          - Contains: 4 service cards (Web Dev, Design, AI Video, Ads)
        */}
        <div data-scroll-section>
          <FeatureCards />
        </div>

        {/* 
          SECTION 3: Showcase Section 1 - Website Development
          - data-scroll-section: Each showcase gets its own section
          - Prevents rendering issues with large content blocks
        */}
        <div data-scroll-section>
          <ShowcaseSection
            title="Modern Web Development"
            description="Building responsive, fast, and SEO-optimized websites that convert visitors into customers. From simple landing pages to complex web applications, I create digital experiences that drive business growth."
            imageUrl="/src/assets/images/graphic-design-wpap-3.png?format=webp"
            tags={["React & Next.js", "Responsive Design", "SEO Optimization", "Performance"]}
            icon={Code2}
          />
        </div>

        {/* 
          SECTION 4: Showcase Section 2 - Graphic Design
          - data-scroll-section: Independent section for proper Locomotive detection
        */}
        <div data-scroll-section>
          <ShowcaseSection
            title="Professional Graphic Design"
            description="Creating stunning visual identities that make your brand stand out. Complete design solutions including logos, marketing materials, and social media graphics that capture attention and drive engagement."
            imageUrl="/src/assets/images/graphic-design-wpap.jpg"
            tags={["Brand Identity", "Logo Design", "Marketing Materials", "Social Media"]}
            icon={Palette}
            reversed
          />
        </div>

        {/* 
          SECTION 5: Showcase Section 3 - AI Video Creation
          - data-scroll-section: Ensures section is visible and scrollable
        */}
        <div data-scroll-section>
          <ShowcaseSection
            title="AI-Powered Video Creation"
            description="Revolutionary video creation technology that generates engaging content with automatic subtitles, voiceovers, and dynamic animations. Perfect for social media marketing and content creation at scale."
            imageUrl="/src/assets/images/graphic-design-wpap-2.png"
            tags={["AI Video Generation", "Automatic Subtitles", "Voice Synthesis", "Social Media"]}
            icon={Video}
          />
        </div>

        {/* 
          SECTION 6: Showcase Section 4 - Lead Generation Ads
          - data-scroll-section: Last showcase section with proper detection
        */}
        <div data-scroll-section>
          <ShowcaseSection
            title="High-Converting Ad Campaigns"
            description="Data-driven Facebook and Instagram ad campaigns that generate qualified leads and maximize ROI. Complete campaign management from strategy development to optimization and performance tracking."
            imageUrl="/src/assets/images/graphic-design-wpap-4.jpeg"
            tags={["Facebook Ads", "Instagram Ads", "Campaign Strategy", "ROI Optimization"]}
            icon={Target}
            reversed
          />
        </div>

        {/* SECTION 7: Footer */}
        <div data-scroll-section>
          <Footer />
        </div>

        {/* EVOXERS Watermark - Separate section after footer */}
        <div data-scroll-section>
          <Watermark />
        </div>
      </div>

      {/* Portfolio Modal - outside scroll container, stays fixed */}
      <Portfolio 
        isOpen={isPortfolioOpen} 
        onClose={() => setIsPortfolioOpen(false)} 
      />
        </>
      )}
    </>
  );
}
