import React, { useEffect, useRef } from "react";

export function Watermark() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textEl = textRef.current;
    if (!textEl) return;

    const spans: HTMLElement[] = Array.from(
      textEl.querySelectorAll<HTMLElement>('.wm-letter')
    );

    const computeCenters = (): number[] =>
      spans.map((el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width / 2;
      });

    let centers = computeCenters();

    const handleResize = () => {
      centers = computeCenters();
    };

    let rafId: number | null = null;
    let lastX = 0;

    const render = () => {
      rafId = null;
      const rect = textEl.getBoundingClientRect();
      const mouseX = lastX;
      const avgWidth = Math.max(1, rect.width / Math.max(1, spans.length));
      const falloff = Math.max(36, avgWidth * 2.0); // slightly tighter for cleaner follow

      spans.forEach((spanEl: HTMLElement, idx: number) => {
        const cx = centers[idx];
        const d = Math.abs(mouseX - cx);
        const base = Math.max(0, 1 - d / falloff);
        const intensity = Math.pow(base, 1.35); // ease curve for smoother trailing
        spanEl.style.setProperty('--i', intensity.toFixed(3));
      });
    };

    const handleMove = (e: PointerEvent) => {
      lastX = e.clientX;
      if (rafId == null) rafId = requestAnimationFrame(render);
    };

    const handleLeave = () => {
      spans.forEach((spanEl: HTMLElement) => spanEl.style.setProperty('--i', '0'));
    };

    window.addEventListener('resize', handleResize);
    textEl.addEventListener('pointermove', handleMove, { passive: true } as AddEventListenerOptions);
    textEl.addEventListener('mouseleave', handleLeave);

    // Initialize to no glow
    handleLeave();

    return () => {
      window.removeEventListener('resize', handleResize);
      textEl.removeEventListener('pointermove', handleMove as unknown as EventListener);
      textEl.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <section aria-hidden="true" style={{ marginTop: 0, marginBottom: 0, paddingBottom: 0, overflow: 'visible' }}>
      <div ref={containerRef} className="watermark-container">
        <div ref={textRef} className="watermark-text">
          <span className="wm-letter">E</span><span className="wm-letter">V</span><span className="wm-letter">O</span><span className="wm-letter">X</span><span className="wm-letter">E</span><span className="wm-letter">R</span><span className="wm-letter">S</span>
        </div>
      </div>
    </section>
  );
}
