import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Locomotive Scroll core styles (required for smooth scroll functionality)
import "locomotive-scroll/dist/locomotive-scroll.css";

// Custom locomotive scroll styles (performance optimizations)
import "./styles/locomotive-custom.css";

// Preload critical images immediately for SUPER FAST loading
(function() {
  'use strict';
  
  const preloadImage = (src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  };
  
  const preloadVideo = (src: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = src;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  };
  
  // Preload critical images that are imported
  import('./assets/images/logo-login.jpg').then(module => {
    const img = new Image();
    img.src = module.default;
  });
  
  import('./assets/images/EVOXERS-LOGO.png').then(module => {
    const img = new Image();
    img.src = module.default;
  });
})();
import "./styles/locomotive-custom.css";

createRoot(document.getElementById("root")!).render(<App />);
