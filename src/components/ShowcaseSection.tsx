import React from "react";
import { motion } from "motion/react";
import { FloatingDeviceMockup } from "./FloatingDeviceMockup";
import { LucideIcon } from "lucide-react";

interface ShowcaseSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  icon: LucideIcon;
  reversed?: boolean;
}

export function ShowcaseSection({
  title,
  description,
  imageUrl,
  tags,
  icon: Icon,
  reversed = false,
}: ShowcaseSectionProps) {
  // REMOVED: Framer Motion scroll-based parallax (conflicts with Locomotive Scroll)
  // const sectionRef = useRef<HTMLElement>(null);
  // const { scrollYProgress } = useScroll({
  //   target: sectionRef,
  //   offset: ["start end", "end start"],
  // });
  // const yRaw = useTransform(scrollYProgress, [0, 1], [50, -50]);
  // const y = useSpring(yRaw, { stiffness: 100, damping: 30 });
  // const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto"
        // REMOVED: style={{ opacity }} - was causing sections to be invisible
      >
        <div className={`grid md:grid-cols-2 gap-16 items-center ${reversed ? "md:flex-row-reverse" : ""}`}>
          {/* Content Side */}
          <motion.div
            className={`space-y-8 ${reversed ? "md:order-2" : ""}`}
            // REMOVED: style={{ y }} - Locomotive Scroll handles parallax now
          >
            {/* Icon */}
            <motion.div
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-blue)]/20"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Icon className="w-8 h-8" style={{ color: "var(--accent-blue)" }} />
            </motion.div>

            {/* Title with Locomotive parallax */}
            <motion.div
              initial={{ opacity: 0, x: reversed ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
            >
              {/* Locomotive Scroll parallax:
                  - data-scroll-speed: 1.2 = subtle parallax on heading
                  - Bugatti-style elegant float effect
              */}
              <h2 
                className="text-5xl md:text-6xl mb-4"
                style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 700 }}
                data-scroll
                data-scroll-speed="1.2"
              >
                {title}
              </h2>
              <p 
                className="text-xl text-muted-foreground leading-relaxed"
                style={{ fontFamily: "'Aeonik', 'Arial', 'Helvetica', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
              >
                {description}
              </p>
            </motion.div>

            {/* Tags */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {tags.map((tag, index) => (
                <motion.span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-muted text-sm border border-border"
                  style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 500 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.3,
                    delay: 0.3 + index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* Stats or additional info */}
            <motion.div
              className="grid grid-cols-3 gap-6 pt-6"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {[
                { value: "60fps", label: "Performance" },
                { value: "100%", label: "Responsive" },
                { value: "A11y", label: "Accessible" },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div 
                    className="text-2xl mb-1"
                    style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 600 }}
                  >
                    {stat.value}
                  </div>
                  <div 
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: "'Aeonik', 'Arial', 'Helvetica', sans-serif", fontWeight: 400 }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Mockup Side with counter parallax */}
          {/* Locomotive Scroll parallax:
              - data-scroll-speed: -0.5 = reverse parallax
              - Creates depth - image moves opposite to text
              - Subtle effect for visual interest without distraction
          */}
          <div 
            className={reversed ? "md:order-1" : ""}
            data-scroll
            data-scroll-speed="-0.5"
          >
            <FloatingDeviceMockup imageUrl={imageUrl} />
          </div>
        </div>
      </motion.div>

    </section>
  );
}
