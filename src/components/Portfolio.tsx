import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { portfolioProjects, type PortfolioCategory } from "./portfolioData";
import DomeGallery from "./DomeGallery";

const categories: Array<{ value: PortfolioCategory | "all"; label: string; icon?: string }> = [
  { value: "all", label: "All" },
  { value: "Logos", label: "Logos" },
  { value: "Social Media Posts", label: "Social Media Posts" },
  { value: "Websites", label: "Websites" },
  { value: "Meta-Ads", label: "Meta-Ads" },
  { value: "Videos", label: "Videos" },
  { value: "MockUps", label: "MockUps" },
  { value: "Banners", label: "Banners" },
];

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory | "all">("all");

  const websiteProjects = useMemo(
    () => portfolioProjects.filter((project) => project.category === "Websites"),
    []
  );

  const videoProjects = useMemo(
    () => portfolioProjects.filter((project) => project.category === "Videos"),
    []
  );

  // Build gallery items; websites handled separately above, videos rendered outside the dome
  const galleryImages = useMemo(() => {
    let projects;
    if (activeCategory === "all") {
      projects = portfolioProjects;
    } else {
      projects = portfolioProjects.filter((project) => project.category === activeCategory);
    }

    // Filter out website links and videos from the dome gallery
    const imageProjects = projects.filter(
      (project) =>
        project.category !== "Websites" &&
        project.mediaType !== "video" &&
        project.image &&
        project.image.trim() !== ""
    );

    // Transform to DomeGallery format: { src, alt, type }
    return imageProjects.map((project) => ({
      src: project.image,
      alt: project.title || project.description || "",
      type: "image" as const
    }));
  }, [activeCategory]);

  return (
    <>
      <style>{`
        .dome-gallery-container {
          height: 80vh;
          min-height: 600px;
          will-change: opacity;
          transform: translateZ(0);
        }
        
        @media (max-width: 767px) {
          .dome-gallery-container {
            height: 70vh;
            min-height: 400px;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .dome-gallery-container {
            height: 75vh;
            min-height: 500px;
          }
        }
        
        /* Optimize shimmer animation with CSS instead of JS */
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateZ(0); }
          100% { transform: translateX(100%) translateZ(0); }
        }
        
        .shimmer-animation {
          animation: shimmer 2s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        
        /* Optimize glow animation with CSS */
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .glow-animation {
          animation: glow-pulse 2s ease-in-out infinite;
          will-change: opacity;
        }
        
        /* GPU acceleration for scroll-heavy elements */
        .portfolio-section {
          transform: translateZ(0);
          will-change: scroll-position;
        }
        
        /* Optimize backdrop blur containers */
        .backdrop-blur-container {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>
      <section 
        id="portfolio" 
        className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 portfolio-section"
        style={{
          background: 'transparent',
          minHeight: '100vh'
        }}
      >
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 md:space-y-16">
        {/* Header Section */}
        <div className="text-center md:text-left">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold uppercase leading-tight tracking-tight break-words"
            style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 700 }}
          >
            Latest Work & Case Studies
          </h2>
        </div>

        {/* Category Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full flex flex-wrap justify-center gap-1.5 sm:gap-2"
        >
          {categories.map((category, index) => {
            const isActive = activeCategory === category.value;
            return (
              <motion.button
                key={category.value}
                onClick={() => setActiveCategory(category.value as PortfolioCategory | "all")}
                className="relative px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 min-h-[44px] whitespace-nowrap cursor-pointer"
                style={{ 
                  fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", 
                  fontWeight: 600,
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated background gradient for active state */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#8E1616] via-[#D84040] to-[#8E1616]"
                      style={{
                        boxShadow: "0 0 30px rgba(142, 22, 22, 0.6), inset 0 0 20px rgba(216, 64, 64, 0.3)",
                      }}
                    >
                      {/* Animated shimmer effect - CSS animation for better performance */}
                      <div
                        className="absolute inset-0 rounded-2xl shimmer-animation"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Inactive state background */}
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-muted/30 border border-border/30 backdrop-blur-sm"
                    whileHover={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(142, 22, 22, 0.3)",
                    }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Text */}
                <span
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category.label}
                </span>

                {/* Active indicator glow - CSS animation for better performance */}
                {isActive && (
                  <div
                    className="absolute -inset-1 rounded-2xl blur-md glow-animation"
                    style={{
                      background: "linear-gradient(135deg, #8E1616, #D84040)",
                      opacity: 0.5,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {activeCategory === "Websites" ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8E1616]/10 via-[#D84040]/10 to-[#8E1616]/10 blur-3xl opacity-50" style={{ transform: 'translateZ(0)' }} />
            <div className="relative bg-gradient-to-br from-background/70 via-muted/10 to-background/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border/50 p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-container" style={{ transform: 'translateZ(0)' }}>
              <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Website Projects</h3>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {websiteProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-border/40 bg-black/40 p-4 sm:p-5 flex flex-col gap-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground/70">Website</p>
                        <h4 className="text-lg sm:text-xl font-semibold">{project.title}</h4>
                      </div>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#8E1616] to-[#D84040] text-sm font-semibold text-white hover:opacity-90 transition cursor-pointer"
                        >
                          Visit Site
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    {project.technologies?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-border/40 text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeCategory === "Videos" ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8E1616]/10 via-[#D84040]/10 to-[#8E1616]/10 blur-3xl opacity-50" style={{ transform: 'translateZ(0)' }} />
            <div className="relative bg-gradient-to-br from-background/70 via-muted/10 to-background/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border/50 p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-container" style={{ transform: 'translateZ(0)' }}>
              <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Video Projects</h3>
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
                {videoProjects.map((project) => {
                  const poster = project.image?.toLowerCase().endsWith(".mp4") ? undefined : project.image;
                  const src = project.videoUrl || project.image;
                  return (
                    <div
                      key={project.id}
                      className="rounded-2xl border border-border/40 bg-black/50 p-4 sm:p-5 flex flex-col gap-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground/70">Video</p>
                          <h4 className="text-lg sm:text-xl font-semibold">{project.title}</h4>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="overflow-hidden rounded-xl border border-border/40 bg-black">
                        <video
                          src={src}
                          poster={poster}
                          controls
                          preload="metadata"
                          className="w-full h-full aspect-video"
                          style={{ backgroundColor: "#000" }}
                        />
                      </div>
                      {project.technologies?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-border/40 text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full dome-gallery-container"
            style={{ transform: 'translateZ(0)' }}
          >
            <DomeGallery
              images={galleryImages}
              overlayBlurColor="#060010"
              grayscale={false}
              fit={0.5}
              minRadius={400}
              maxRadius={800}
              segments={35}
              imageBorderRadius="30px"
              openedImageBorderRadius="30px"
              openedImageWidth={activeCategory === "Meta-Ads" || activeCategory === "Banners" ? "800px" : undefined}
              openedImageHeight={activeCategory === "Meta-Ads" || activeCategory === "Banners" ? "600px" : undefined}
            />
          </motion.div>
        )}
      </div>
    </section>
    </>
  );
}
