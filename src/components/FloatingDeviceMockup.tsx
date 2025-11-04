import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface FloatingDeviceMockupProps {
  children?: React.ReactNode;
  imageUrl?: string;
  title?: string;
  lazyLoad?: boolean;
}

export function FloatingDeviceMockup({ children, imageUrl, title, lazyLoad = true }: FloatingDeviceMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>();

  // Use motion values for smoother animations
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Add spring physics for natural movement
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateXValue = ((y - centerY) / centerY) * -8;
      const rotateYValue = ((x - centerX) / centerX) * 8;
      
      rotateX.set(rotateXValue);
      rotateY.set(rotateYValue);
    });
  }, [rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={containerRef}
      className="group relative w-full max-w-5xl mx-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        perspective: "2000px",
      }}
    >
      <motion.div
        className="relative"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Breathing glow effect behind image */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl opacity-25 group-hover:opacity-50 transition-opacity duration-300"
          style={{
            background: "linear-gradient(135deg, #BE1616, #DB4040)",
            filter: "blur(8px)",
            margin: "-15px",
          }}
          animate={{
            scale: [1.02, 1.05, 1.02],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{
            scale: 1.08,
            opacity: 0.5,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          }}
        />

        {/* Image Frame without browser header */}
        <div className="relative bg-background border border-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Content Area */}
          <div className="relative aspect-[16/10] bg-background overflow-hidden">
            {imageUrl ? (
              <ImageWithFallback
                src={imageUrl}
                alt="Showcase content"
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              children
            )}
            
            {/* Reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
