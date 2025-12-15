import React from "react";
import { Command } from "cmdk";
import { portfolioProjects } from "./portfolioData";
import { 
  Home, 
  Briefcase, 
  Mail, 
  Code2, 
  Palette, 
  Video, 
  Target,
  Search as SearchIcon,
  FileText,
  Zap,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (path: string, hash?: string) => void;
}

export function SearchCommand({ open, onOpenChange, onNavigate }: SearchCommandProps) {
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac && e.metaKey && e.key.toLowerCase() === "k") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = original || "";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = original || "";
    };
  }, [open, onOpenChange]);

  const handleNav = (path: string, hash?: string) => {
    onNavigate(path, hash);
    onOpenChange(false);
  };

  const handleEmail = () => {
    window.location.href = "mailto:info@evoxers.com";
    onOpenChange(false);
  };

  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC");

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          className="fixed inset-0 z-[80]"
          onClick={() => onOpenChange(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Minimal Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            onClick={() => onOpenChange(false)}
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(20px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
          />
          
          <div 
            className="absolute inset-0 flex items-start justify-center pt-24 px-4 pb-4"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div 
              className="pointer-events-auto w-full max-w-2xl" 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Command
                label="Search"
                className="relative w-full rounded-2xl bg-background/80 backdrop-blur-2xl border border-border/20 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
              >
                {/* Minimal Search Input */}
                <div className="relative px-5 py-4">
                  <div className="relative w-full">
                    {/* <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 z-10" /> */}
                    <Command.Input
                      autoFocus
                      placeholder="Search..."
                      className="w-full pl-7 pr-28 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-0"
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {/* <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/60 bg-muted/20 border border-border/30 rounded-md whitespace-nowrap">
                        {isMac ? "⌘" : "Ctrl"}K
                      </kbd> */}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/10 mx-5" />

                {/* Results List */}
                <Command.List className="max-h-[65vh] overflow-y-auto px-2 py-3">
                  <Command.Empty className="flex flex-col items-center justify-center py-20 px-4">
                    <SearchIcon className="w-8 h-8 text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground/50">No results found</p>
                  </Command.Empty>

                  {/* Pages Group */}
                  <Command.Group 
                    heading={
                      <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                        Pages
                      </div>
                    } 
                    className="py-1"
                  >
                    <Command.Item 
                      onSelect={() => handleNav("/", "#hero")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Home className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">Home</span>
                    </Command.Item>

                    <Command.Item 
                      onSelect={() => handleNav("/", "#services")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Zap className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">Services</span>
                    </Command.Item>

                    <Command.Item 
                      onSelect={() => handleNav("/portfolio")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Briefcase className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">Portfolio</span>
                    </Command.Item>

                    <Command.Item 
                      onSelect={() => handleNav("/", "#contact")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Mail className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">Contact</span>
                    </Command.Item>
                  </Command.Group>

                  {/* Showcases Group */}
                  <Command.Group 
                    heading={
                      <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                        Showcases
                      </div>
                    } 
                    className="py-1"
                  >
                    <Command.Item 
                      onSelect={() => handleNav("/", "#showcase-web")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Code2 className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">Modern Web Development</span>
                    </Command.Item>

                    <Command.Item 
                      onSelect={() => handleNav("/", "#showcase-design")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Palette className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">Graphic Design</span>
                    </Command.Item>

                    <Command.Item 
                      onSelect={() => handleNav("/", "#showcase-video")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Video className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">AI Video Creation</span>
                    </Command.Item>

                    <Command.Item 
                      onSelect={() => handleNav("/", "#showcase-ads")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Target className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">Ad Campaigns</span>
                    </Command.Item>
                  </Command.Group>

                  {/* Portfolio Group */}
                  <Command.Group 
                    heading={
                      <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                        Portfolio
                      </div>
                    } 
                    className="py-1"
                  >
                    {portfolioProjects.slice(0, 15).map((p) => (
                      <Command.Item
                        key={p.id}
                        onSelect={() => handleNav("/portfolio")}
                        className="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-medium truncate">{p.title}</div>
                          <div className="text-xs text-muted-foreground/40 truncate">{p.category}</div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  {/* Actions Group */}
                  <Command.Group 
                    heading={
                      <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                        Actions
                      </div>
                    } 
                    className="py-1"
                  >
                    <Command.Item 
                      onSelect={() => handleNav("/portfolio")} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Globe className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <span className="text-sm font-medium">Open Portfolio</span>
                    </Command.Item>

                    <Command.Item 
                      onSelect={handleEmail} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors aria-selected:bg-accent/30 aria-selected:text-foreground"
                    >
                      <Mail className="w-4 h-4 text-muted-foreground/50 group-aria-selected:text-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Send Email</span>
                        <span className="text-xs text-muted-foreground/40">info@evoxers.com</span>
                      </div>
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


