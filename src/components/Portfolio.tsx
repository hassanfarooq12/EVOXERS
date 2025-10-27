import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Github, Eye } from "lucide-react";
import { Button } from "./ui/button";

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  features: string[];
}

const portfolioProjects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Platform",
    category: "Website Development",
    description: "A modern, responsive e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, payment integration, inventory management, and admin dashboard.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjB3ZWJzaXRlfGVufDF8fHx8MTc2MTA1MzcwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    technologies: ["React", "Node.js", "MongoDB", "Stripe", "Tailwind CSS"],
    liveUrl: "#",
    githubUrl: "#",
    features: ["User Authentication", "Payment Integration", "Admin Dashboard", "Responsive Design", "Inventory Management"]
  },
  {
    id: 2,
    title: "Brand Identity Design",
    category: "Graphic Design",
    description: "Complete brand identity design for a tech startup including logo design, color palette, typography, business cards, and marketing materials.",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZCUyMGlkZW50aXR5JTIwZGVzaWdufGVufDF8fHx8MTc2MTA1MzcwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    technologies: ["Adobe Illustrator", "Adobe Photoshop", "Figma", "Brand Guidelines"],
    features: ["Logo Design", "Color Palette", "Typography", "Business Cards", "Marketing Materials"]
  },
  {
    id: 3,
    title: "AI Video Creation Suite",
    category: "AI Video Creation",
    description: "An AI-powered video creation platform that generates engaging videos with automatic subtitles, voiceovers, and dynamic animations for social media marketing.",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHZpZGVvJTIwY3JlYXRpb258ZW58MXx8fHx8MTc2MTA1MzcwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    technologies: ["Python", "OpenAI", "FFmpeg", "React", "Node.js"],
    liveUrl: "#",
    githubUrl: "#",
    features: ["AI Video Generation", "Automatic Subtitles", "Voice Synthesis", "Social Media Optimization", "Batch Processing"]
  },
  {
    id: 4,
    title: "Facebook Ads Campaign",
    category: "Lead Generation",
    description: "High-converting Facebook and Instagram ad campaigns that generated 500+ qualified leads with 3.2x ROAS. Complete campaign management from setup to optimization.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlYm9vayUyMGFkcyUyMGNhbXBhaWdufGVufDF8fHx8MTc2MTA1MzcwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    technologies: ["Facebook Ads Manager", "Instagram Ads", "Google Analytics", "Conversion Tracking"],
    features: ["Campaign Strategy", "Audience Targeting", "Creative Design", "A/B Testing", "Performance Optimization"]
  },
  {
    id: 5,
    title: "Corporate Website",
    category: "Website Development",
    description: "A professional corporate website with modern design, SEO optimization, and integrated CRM. Features include contact forms, blog system, and analytics dashboard.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB3ZWJzaXRlfGVufDF8fHx8MTc2MTA1MzcwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    technologies: ["React", "Next.js", "WordPress", "SEO", "Google Analytics"],
    liveUrl: "#",
    githubUrl: "#",
    features: ["Responsive Design", "SEO Optimization", "Contact Forms", "Blog System", "Analytics Dashboard"]
  },
  {
    id: 6,
    title: "Social Media Graphics",
    category: "Graphic Design",
    description: "Complete social media graphics package including posts, stories, and banner designs for various platforms. Consistent brand identity across all channels.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGdyYXBoaWNzfGVufDF8fHx8MTc2MTA1MzcwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    technologies: ["Adobe Photoshop", "Canva", "Figma", "Social Media Templates"],
    features: ["Post Designs", "Story Templates", "Banner Graphics", "Brand Consistency", "Platform Optimization"]
  }
];

interface PortfolioProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Portfolio({ isOpen, onClose }: PortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Portfolio Modal */}
          <motion.div
            className="fixed inset-4 bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-3xl font-bold">My Portfolio</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {selectedProject ? (
                /* Project Detail View */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Back Button */}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProject(null)}
                    className="mb-4"
                  >
                    ← Back to Portfolio
                  </Button>

                  {/* Project Image */}
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>

                  {/* Project Info */}
                  <div className="space-y-4">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-muted text-sm mb-2">
                        {selectedProject.category}
                      </span>
                      <h3 className="text-2xl font-bold mb-2">{selectedProject.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    {/* Technologies */}
                    <div>
                      <h4 className="font-semibold mb-2">Technologies Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {selectedProject.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      {selectedProject.liveUrl && (
                        <Button asChild>
                          <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                      {selectedProject.githubUrl && (
                        <Button variant="outline" asChild>
                          <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            View Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Portfolio Grid */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      className="group cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="relative overflow-hidden rounded-xl bg-card border border-border">
                        {/* Project Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        {/* Project Info */}
                        <div className="p-4 space-y-2">
                          <span className="inline-block px-2 py-1 rounded-full bg-muted text-xs">
                            {project.category}
                          </span>
                          <h3 className="font-semibold group-hover:text-accent-blue transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-2">
                            {project.technologies.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-1 rounded text-xs bg-accent text-accent-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                                +{project.technologies.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
