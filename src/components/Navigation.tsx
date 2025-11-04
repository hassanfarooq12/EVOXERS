import React from "react";
import { motion } from "motion/react";
import { Menu, Search } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import evoxersLogo from "../assets/images/EVOXERS-LOGO.png";

interface NavigationProps {
  onNavigate: (path: string, hash?: string) => void;
}

const navLinks = [
  { label: "Home", path: "/", hash: "#hero" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Services", path: "/", hash: "#services" },
  { label: "Contact", path: "/", hash: "#contact" },
];

export function Navigation({ onNavigate }: NavigationProps) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-2"
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
            <motion.a
              href="/"
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => { e.preventDefault(); onNavigate("/", "#hero"); }}
            >
              <ImageWithFallback
                src={evoxersLogo}
                alt="EVOXERS Logo"
                className="h-10 w-auto object-contain"
                loading="eager"
                fetchPriority="high"
              />
            </motion.a>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => {
                const href = link.hash ? `${link.path}${link.hash}` : link.path;
                return (
                  <motion.a
                    key={link.label}
                    href={href}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                    onClick={(event) => {
                      event.preventDefault();
                      onNavigate(link.path, link.hash);
                    }}
                  >
                    {link.label}
                  </motion.a>
                );
              })}
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
