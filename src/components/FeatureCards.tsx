import React from "react";
import { motion } from "motion/react";
import { Code2, Palette, Video, Target } from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Website Development",
    description: "Modern, responsive websites built with cutting-edge technologies. From simple landing pages to complex web applications, I create digital experiences that convert visitors into customers.",
    color: "#00D4FF", // Bright Cyan
    features: ["React & Next.js", "Responsive Design", "SEO Optimization", "Performance Focused"]
  },
  {
    icon: Palette,
    title: "Graphic Design",
    description: "Complete graphic design solutions including brand identity, logo design, marketing materials, and social media graphics. Professional designs that make your brand stand out.",
    color: "#FF6B6B", // Coral Red
    features: ["Brand Identity", "Logo Design", "Marketing Materials", "Social Media Graphics"]
  },
  {
    icon: Video,
    title: "AI Video Creation",
    description: "Revolutionary AI-powered video creation with automatic subtitles, voiceovers, and dynamic animations. Perfect for social media marketing and content creation.",
    color: "#4ECDC4", // Teal
    features: ["AI Video Generation", "Automatic Subtitles", "Voice Synthesis", "Social Media Ready"]
  },
  {
    icon: Target,
    title: "Lead Generation Ads",
    description: "High-converting Facebook and Instagram ad campaigns that generate qualified leads. Complete campaign management from strategy to optimization for maximum ROI.",
    color: "#45B7D1", // Sky Blue
    features: ["Facebook & Instagram Ads", "Campaign Strategy", "A/B Testing", "ROI Optimization"]
  },
];

export function FeatureCards() {
  return (
    <section id="services" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Locomotive parallax */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Locomotive Scroll parallax:
              - data-scroll-speed: 1.5 = subtle upward float
              - Creates elegant Bugatti-style parallax on section heading
          */}
          <h2 
            className="text-5xl md:text-6xl mb-6"
            style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 700 }}
            data-scroll
            data-scroll-speed="1.5"
          >
            Our Services
          </h2>
          <p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            style={{ fontFamily: "'Aeonik', 'Arial', 'Helvetica', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
          >
            Comprehensive digital solutions to transform your business and drive growth
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.1,
              }}
            >
              <motion.div
                className="relative h-full p-8 rounded-2xl bg-card border border-border overflow-hidden"
                whileHover={{
                  y: -8,
                  transition: {
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
                style={{
                  boxShadow: `0 0 20px ${service.color}30`,
                }}
              >
                {/* Minimal base glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${service.color}20, transparent)`,
                  }}
                />

                {/* Subtle glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${service.color}30, transparent)`,
                  }}
                />

                {/* Icon */}
                <motion.div
                  className="relative inline-flex p-4 rounded-xl mb-6 bg-muted"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <service.icon className="w-8 h-8" style={{ color: service.color }} />
                </motion.div>

                {/* Content */}
                <h3 
                  className="text-2xl mb-4 relative font-bold"
                  style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 600 }}
                >
                  {service.title}
                </h3>
                <p 
                  className="text-muted-foreground relative mb-6 leading-relaxed"
                  style={{ fontFamily: "'Aeonik', 'Arial', 'Helvetica', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
                >
                  {service.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex} 
                      className="flex items-center gap-2 text-sm"
                      style={{ fontFamily: "'Aeonik', 'Arial', 'Helvetica', sans-serif", fontWeight: 400 }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: service.color }}
                      />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Minimal shadow glow on hover */}
                <div
                  className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-30 transition-all duration-300 pointer-events-none"
                  style={{ 
                    background: service.color,
                    filter: "blur(15px)",
                    transform: "scale(1.1)",
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
