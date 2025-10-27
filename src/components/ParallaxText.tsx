import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

interface ParallaxTextProps {
  children: string;
  baseVelocity?: number;
}

export function ParallaxText({ children, baseVelocity = 1 }: ParallaxTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Smooth spring animation
  const x = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, baseVelocity * 100]),
    { stiffness: 100, damping: 30 }
  );

  return (
    <div ref={ref} className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="flex gap-8 text-6xl md:text-8xl opacity-5 will-change-transform"
        style={{ 
          x: useTransform(x, (v) => `${v}%`),
        }}
      >
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
      </motion.div>
    </div>
  );
}
