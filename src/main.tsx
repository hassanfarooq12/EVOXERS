import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Locomotive Scroll core styles (required for smooth scroll functionality)
import "locomotive-scroll/dist/locomotive-scroll.css";

// Custom locomotive scroll styles (performance optimizations)
import "./styles/locomotive-custom.css";

createRoot(document.getElementById("root")!).render(<App />);
