import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Search, X } from "lucide-react";
import { SearchCommand } from "./SearchCommand";
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Close on ESC and lock scroll when open
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    // Scroll lock
    const original = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = original || '';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = original || '';
    };
  }, [isOpen]);

  // Ctrl/Cmd+K to open search
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac && e.metaKey && e.key.toLowerCase() === "k") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setIsSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleNavigate = (path: string, hash?: string) => {
    setIsOpen(false);
    onNavigate(path, hash);
  };

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
                      handleNavigate(link.path, link.hash);
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
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Search (Ctrl/⌘+K)" onClick={() => setIsSearchOpen(true)}>
                  <Search className="w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div
                className="md:hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Open menu"
                  aria-expanded={isOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setIsOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            {/* Panel */}
            <motion.aside
              id="mobile-menu"
              className="fixed right-0 top-0 z-[70] h-dvh w-[85%] max-w-sm bg-background border-l border-border p-6 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="flex items-center justify-between mb-6">
                <a href="/" onClick={(e) => { e.preventDefault(); handleNavigate('/', '#hero'); }} className="flex items-center gap-2">
                  <ImageWithFallback src={evoxersLogo} alt="EVOXERS Logo" className="h-8 w-auto" />
                </a>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Close menu" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => {
                  const href = link.hash ? `${link.path}${link.hash}` : link.path;
                  return (
                    <a
                      key={link.label}
                      href={href}
                      className="rounded-xl px-4 py-3 border border-border bg-card/40 hover:bg-card transition-colors text-foreground/90"
                      onClick={(e) => { e.preventDefault(); handleNavigate(link.path, link.hash); }}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </nav>
              <div className="mt-auto pt-6">
                <Button className="w-full" onClick={(e) => { e.preventDefault(); handleNavigate('/portfolio'); }}>View Portfolio</Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} onNavigate={handleNavigate} />
    </motion.nav>
  );
}
