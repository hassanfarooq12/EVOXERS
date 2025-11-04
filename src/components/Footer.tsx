import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, Twitter, Linkedin, Mail, ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import evoxersLogo from "../assets/images/EVOXERS-LOGO.jpg";

interface FooterProps {
  onNavigate?: (path: string, hash?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollPosition / documentHeight) * 100;
      
      // Show button when user scrolls past 30% of the page
      setShowScrollToTop(scrollPercentage > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com/", label: "GitHub" },
    { icon: Twitter, href: "https://x.com/", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@evoxers.com", label: "Email" },
  ];

  return (
    <footer ref={footerRef} className="relative border-t border-border mt-32" style={{
      marginBottom: 0,
      paddingBottom: 0,
      position: 'relative',
      zIndex: 10,
      background: 'transparent'
    }}>
      <div className="footer-content max-w-7xl mx-auto px-6 py-16" style={{
        marginBottom: 0,
        paddingBottom: 0,
        position: 'relative',
        zIndex: 10
      }}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <motion.div
            className="space-y-4 footer-col"
            data-segment="e"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img 
              src={evoxersLogo} 
              alt="EVOXERS Logo" 
              className="h-8 w-auto object-contain mb-2"
            />
            <p className="text-muted-foreground">
              Crafting exceptional digital experiences with cutting-edge technology.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="space-y-4 footer-col"
            data-segment="vo"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4
              className="text-sm uppercase tracking-wider text-muted-foreground"
              style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 600 }}
            >
              Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Portfolio", path: "/portfolio" },
                { label: "Services", path: "/", hash: "#services" },
                { label: "Contact", path: "/", hash: "#contact" },
              ].map((item) => {
                const href = item.hash ? `${item.path}${item.hash}` : item.path;
                return (
                  <motion.li
                    key={item.label}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <a
                      href={href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(event) => {
                        if (onNavigate) {
                          event.preventDefault();
                          onNavigate(item.path, item.hash);
                        }
                      }}
                    >
                      {item.label}
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
          {/* Contact */}
          <motion.div
            className="space-y-4 footer-col"
            data-segment="xer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4
              className="text-sm uppercase tracking-wider text-muted-foreground"
              style={{ fontFamily: "'Josefin Sans', 'Arial', 'Helvetica', sans-serif", fontWeight: 600 }}
            >
              Contact
            </h4>
            <ul className="space-y-3">
              <motion.li whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Get in touch</a>
              </motion.li>
              <motion.li whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <a href="mailto:hello@evoxers.com" className="text-muted-foreground hover:text-foreground transition-colors">Email</a>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border footer-col" data-segment="s" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            © 2025 EVOXERS. All rights reserved.
          </motion.p>

          {/* Social Links */}
          <motion.div
            className="flex items-center gap-4 footer-col"
            data-segment="s"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button variant="ghost" size="icon" className="rounded-full">
                  <social.icon className="w-4 h-4" />
                </Button>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 rounded-full bg-foreground text-background shadow-lg z-50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
