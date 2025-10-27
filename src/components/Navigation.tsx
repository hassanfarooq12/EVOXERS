import React from "react";
import { motion } from "motion/react";
import { Menu, Search, Grid3x3 } from "lucide-react";
import { Button } from "./ui/button";

interface NavigationProps {
  onPortfolioClick: () => void;
}

export function Navigation({ onPortfolioClick }: NavigationProps) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.1,
      }}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-background/80 border border-border rounded-2xl px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
                <Grid3x3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">Showcase</span>
            </motion.div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center gap-8">
              {["Portfolio", "Services", "About", "Contact"].map((item, index) => (
                <motion.a
                  key={item}
                  href={item === "Portfolio" ? "#" : `#${item.toLowerCase()}`}
                  onClick={item === "Portfolio" ? (e) => { e.preventDefault(); onPortfolioClick(); } : undefined}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Search className="w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div
                className="md:hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
