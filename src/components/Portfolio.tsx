import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Eye, Play } from "lucide-react";
import { Button } from "./ui/button";
import { portfolioProjects, type PortfolioCategory, type Project } from "./portfolioData";

const categories: Array<{ value: PortfolioCategory | "all"; label: string; icon?: string }> = [
  { value: "all", label: "All" },
  { value: "Videos", label: "Videos" },
  { value: "Meta-Ads", label: "Meta-Ads" },
  { value: "MockUps", label: "MockUps" },
  { value: "Logos", label: "Logos" },
  { value: "Banners", label: "Banners" },
  { value: "Social Media Posts", label: "Social Media Posts" },
  { value: "Websites", label: "Websites" },
];

export function Portfolio() {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory | "all">("all");
  // Don't auto-select initially - let user choose to avoid duplication appearance
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const filteredProjects = useMemo(() => {
    let projects;
    if (activeCategory === "all") {
      projects = portfolioProjects;
    } else {
      projects = portfolioProjects.filter((project) => project.category === activeCategory);
    }
    // Ensure no duplicates by ID
    const seenIds = new Set<number>();
    return projects.filter((project) => {
      if (seenIds.has(project.id)) {
        return false;
      }
      seenIds.add(project.id);
      return true;
    });
  }, [activeCategory]);

  // Clear selectedProject if it's a video or if it's not in the filtered projects
  // Only auto-select if there's no valid selected project
  React.useEffect(() => {
    if (selectedProject) {
      // If selected project is video or not in current filtered projects, clear it
      if (selectedProject.mediaType === "video" || !filteredProjects.includes(selectedProject)) {
        setSelectedProject(null);
      }
    }
    // Don't auto-select - let user choose manually to avoid duplication appearance
  }, [activeCategory, filteredProjects]);

  return (
    <section id="portfolio" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center md:text-left space-y-6">
          <span className="px-4 py-1 rounded-full border border-border text-sm uppercase tracking-widest text-muted-foreground/80">
            Portfolio
          </span>
          <h2
            className="text-5xl md:text-6xl font-bold uppercase leading-tight tracking-tight"
            style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 700 }}
          >
            Latest Work & Case Studies
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-8">
              {/* Modern Animated Navbar/Tabs */}
              <div className="w-full relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Glowing background effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#8E1616]/10 via-[#D84040]/10 to-[#8E1616]/10 blur-2xl opacity-50" />
                  
                  {/* Main container */}
                  <div className="relative bg-gradient-to-br from-background/80 via-muted/20 to-background/80 backdrop-blur-xl rounded-3xl border border-border/50 p-2 shadow-2xl">
                    <div className="relative flex flex-wrap justify-center gap-2 p-1">
                      {categories.map((category, index) => {
                        const isActive = activeCategory === category.value;
                        return (
                          <motion.button
                            key={category.value}
                            onClick={() => setActiveCategory(category.value as PortfolioCategory | "all")}
                            className="relative px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-2xl overflow-hidden transition-all duration-300 z-10"
                            style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 600 }}
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
                                  {/* Animated shimmer effect */}
                                  <motion.div
                                    className="absolute inset-0 rounded-2xl"
                                    style={{
                                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                    }}
                                    animate={{
                                      x: ["-100%", "100%"],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "linear",
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

                            {/* Active indicator glow */}
                            {isActive && (
                              <motion.div
                                className="absolute -inset-1 rounded-2xl blur-md opacity-50"
                                style={{
                                  background: "linear-gradient(135deg, #8E1616, #D84040)",
                                }}
                                animate={{
                                  opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {filteredProjects.map((project, index) => {
                  const isVideo = project.mediaType === "video" && project.videoUrl;
                  const isPlaying = playingVideoId === project.id;

                  const handleVideoClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const video = videoRefs.current[project.id];
                    
                    if (video) {
                      if (isPlaying) {
                        video.pause();
                        setPlayingVideoId(null);
                        video.muted = true;
                        video.removeAttribute('controls');
                      } else {
                        // Pause all other videos
                        Object.values(videoRefs.current).forEach((v) => {
                          if (v && v !== video) {
                            v.pause();
                            v.muted = true;
                            v.removeAttribute('controls');
                          }
                        });
                        
                        // Play this video with sound and controls
                        video.muted = false;
                        video.setAttribute('controls', 'true');
                        video.play().catch(console.error);
                        setPlayingVideoId(project.id);
                        // Don't set selectedProject for videos - videos play in place only
                      }
                    }
                  };

                  const handleCardClick = () => {
                    if (!isVideo) {
                      setSelectedProject(project);
                    }
                  };

                                    // Check if this is a website project (no image)
                  const isWebsite = project.category === "Websites" && !project.image;

                  return (
                    <motion.div
                      key={project.id}
                      className="group text-left"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}       
                    >
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 group-hover:shadow-lg">  
                        {isWebsite ? (
                          <>
                            {/* Unique Website Card Design */}
                            <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative h-48 overflow-hidden cursor-pointer group/website"
                          >
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#8E1616]/20 via-[#D84040]/10 to-[#8E1616]/20 group-hover/website:from-[#8E1616]/40 group-hover/website:via-[#D84040]/30 group-hover/website:to-[#8E1616]/40 transition-all duration-500" />
                            
                            {/* Animated grid pattern overlay */}
                            <div className="absolute inset-0 opacity-[0.03] group-hover/website:opacity-[0.08] transition-opacity duration-500"
                              style={{
                                backgroundImage: `
                                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px'
                              }}
                            />
                            
                            {/* Shimmer effect */}
                            <motion.div
                              className="absolute inset-0 opacity-0 group-hover/website:opacity-100"
                              style={{
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                              }}
                              animate={{
                                x: ["-100%", "100%"],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            />
                            
                            {/* Content */}
                            <div className="relative h-full flex flex-col items-center justify-center p-6 space-y-4 z-10">
                              {/* Website Icon/Browser Window */}
                              <motion.div
                                className="relative"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8E1616] to-[#D84040] flex items-center justify-center shadow-2xl group-hover/website:shadow-[#D84040]/50">
                                  <ExternalLink className="w-8 h-8 text-white" />
                                </div>
                              </motion.div>
                              
                                                             {/* Domain Name */}
                               <div className="text-center space-y-1">
                                 <h3
                                   className="text-lg font-bold uppercase tracking-tight text-foreground group-hover/website:text-[#D84040] transition-colors duration-300"
                                   style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 700 }}
                                 >
                                   {project.title}
                                 </h3>
                                 {project.liveUrl && (
                                   <p className="text-xs text-muted-foreground group-hover/website:text-foreground/70 transition-colors duration-300 font-mono">
                                     {(() => {
                                       try {
                                         return new URL(project.liveUrl).hostname.replace('www.', '');
                                       } catch {
                                         return project.liveUrl.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
                                       }
                                     })()}
                                   </p>
                                 )}
                               </div>
                              
                              {/* Visit Label */}
                              <motion.div
                                className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground group-hover/website:text-[#D84040] transition-colors duration-300"
                                initial={{ opacity: 0.7 }}
                                whileHover={{ opacity: 1 }}
                              >
                                <span>Visit Website</span>
                                <ExternalLink className="w-3 h-3" />
                              </motion.div>
                            </div>
                            
                                                         {/* Glow effect on hover */}
                             <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8E1616] via-[#D84040] to-[#8E1616] opacity-0 group-hover/website:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
                           </a>
                           {/* Website Card Footer */}
                           <div className="p-5 space-y-3 border-t border-border/50">
                             <span className="inline-block rounded-full bg-gradient-to-r from-[#8E1616]/20 to-[#D84040]/20 border border-[#D84040]/30 px-3 py-1 text-xs uppercase tracking-wide text-[#D84040]">
                               {project.category}
                             </span>
                             <div className="flex flex-wrap gap-2 pt-2">
                               {project.technologies.slice(0, 3).map((tech) => (
                                 <span key={tech} className="rounded bg-muted/50 border border-border/50 px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                                   {tech}
                                 </span>
                               ))}
                               {project.technologies.length > 3 && (
                                 <span className="rounded bg-muted px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                                   +{project.technologies.length - 3}
                                 </span>
                               )}
                             </div>
                           </div>
                          </>
                        ) : (
                          <>
                            <div
                              className="relative h-48 overflow-hidden cursor-pointer"                                                                              
                              onClick={isVideo ? handleVideoClick : handleCardClick}
                            >
                              {isVideo ? (
                                <video
                                  ref={(el) => (videoRefs.current[project.id] = el)}
                                  src={project.videoUrl}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"                                    
                                  muted
                                  loop
                                  playsInline
                                  preload="metadata"
                                />
                              ) : (
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                  decoding="async"
                                />
                              )}
                              {isVideo && !isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 transition-opacity duration-300 hover:bg-black/60">                                                                       
                                  <Play className="w-12 h-12 text-white fill-white drop-shadow-lg" />                                                               
                                </div>
                              )}
                              {!isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">                                                                   
                                  <Eye className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleCardClick}
                              className="w-full text-left"
                            >
                              <div className="p-5 space-y-3">
                                <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide">                                         
                                  {project.category}
                                </span>
                                <h3
                                  className="text-xl font-bold uppercase transition-colors duration-300 group-hover:text-accent-blue"                                   
                                  style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 600 }}                                           
                                >
                                  {project.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {project.technologies.slice(0, 3).map((tech) => (     
                                    <span key={tech} className="rounded bg-accent px-2 py-1 text-[11px] uppercase tracking-wide text-accent-foreground">                
                                      {tech}
                                    </span>
                                  ))}
                                  {project.technologies.length > 3 && (
                                    <span className="rounded bg-muted px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">                             
                                      +{project.technologies.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                                                     </>
                         )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            <aside className="w-full lg:max-w-sm space-y-6">
              <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-6 space-y-6">
                {selectedProject && selectedProject.mediaType !== "video" ? (
                  <>
                    <div className="rounded-lg overflow-hidden bg-muted/20">
                      <img
                        src={selectedProject.image}
                        alt={selectedProject.title}
                        className="w-full h-auto object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="inline-block rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {selectedProject.category}
                      </span>
                      <h3 
                        className="text-2xl font-bold uppercase tracking-tight"
                        style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 600 }}
                      >
                        {selectedProject.title}
                      </h3>
                    </div>

                    {selectedProject.liveUrl && (
                      <Button asChild className="w-full">
                        <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit Live Project
                        </a>
                      </Button>
                    )}
                  </>
                ) : null}
              </div>
            </aside>
          </div>
      </div>
    </section>
  );
}
