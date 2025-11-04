import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Locomotive Scroll core styles (required for smooth scroll functionality)
import "locomotive-scroll/dist/locomotive-scroll.css";

// Custom locomotive scroll styles (performance optimizations)
import "./styles/locomotive-custom.css";

// Apply favicons from assets to ensure correct bundling (use latest files)
import faviconSvg from "./assets/images/favicon.svg?url";
import favicon96 from "./assets/images/favicon-96x96.png?url";
import appleTouch from "./assets/images/apple-touch-icon.png?url";

function ensureFavicon(rel: string, attributes: Record<string, string>) {
  const selector = Object.entries({ rel, ...attributes })
    .map(([k, v]) => `[${k}='${v}']`)
    .join("");
  let link = document.head.querySelector<HTMLLinkElement>(`link${selector}`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel as any;
    Object.entries(attributes).forEach(([k, v]) => link!.setAttribute(k, v));
    document.head.appendChild(link);
  }
  return link;
}

// Set on startup (SVG primary, PNG fallback)
ensureFavicon("icon", { type: "image/svg+xml" }).href = faviconSvg;
ensureFavicon("icon", { type: "image/png", sizes: "96x96" }).href = favicon96;
ensureFavicon("apple-touch-icon", { sizes: "180x180" }).href = appleTouch;

createRoot(document.getElementById("root")!).render(<App />);
