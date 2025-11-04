import React from "react";
import { Command } from "cmdk";
import { portfolioProjects } from "./portfolioData";

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
    window.location.href = "mailto:hello@evoxers.com";
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="absolute inset-0 flex items-start justify-center pt-24 px-4">
        <Command
          label="Search"
          className="w-full max-w-2xl rounded-2xl border border-border bg-card text-foreground shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border/60">
            <Command.Input
              autoFocus
              placeholder="Search pages, services, portfolio… (Ctrl/⌘+K)"
              className="w-full bg-transparent outline-none text-base placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[50vh] overflow-y-auto">
            <Command.Empty className="px-4 py-3 text-muted-foreground">No results found.</Command.Empty>

            <Command.Group heading="Pages" className="px-1 py-2">
              <Command.Item onSelect={() => handleNav("/", "#hero")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">
                Home
              </Command.Item>
              <Command.Item onSelect={() => handleNav("/", "#services")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">
                Services
              </Command.Item>
              <Command.Item onSelect={() => handleNav("/portfolio")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">
                Portfolio
              </Command.Item>
              <Command.Item onSelect={() => handleNav("/", "#contact")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">
                Contact
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Showcases" className="px-1 py-2">
              <Command.Item onSelect={() => handleNav("/", "#showcase-web")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">Modern Web Development</Command.Item>
              <Command.Item onSelect={() => handleNav("/", "#showcase-design")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">Graphic Design</Command.Item>
              <Command.Item onSelect={() => handleNav("/", "#showcase-video")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">AI Video Creation</Command.Item>
              <Command.Item onSelect={() => handleNav("/", "#showcase-ads")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">Ad Campaigns</Command.Item>
            </Command.Group>

            <Command.Group heading="Portfolio" className="px-1 py-2">
              {portfolioProjects.slice(0, 30).map((p) => (
                <Command.Item
                  key={p.id}
                  onSelect={() => handleNav("/portfolio")}
                  className="px-3 py-2 rounded-md aria-selected:bg-muted/50"
                >
                  {p.title} — {p.category}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className="px-1 py-2">
              <Command.Item onSelect={() => handleNav("/portfolio")} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">Open Portfolio</Command.Item>
              <Command.Item onSelect={handleEmail} className="px-3 py-2 rounded-md aria-selected:bg-muted/50">Email</Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}


