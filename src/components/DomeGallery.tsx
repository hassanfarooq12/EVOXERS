import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useGesture } from '@use-gesture/react';

type ImageItem =
  | string
  | {
      src: string;
      alt?: string;
      type?: 'image' | 'video';
      poster?: string;
    };

type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  type: 'image' | 'video';
  poster?: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;

const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};

const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: ImageItem[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];
  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });
  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '', type: 'image', poster: '' }));
  }
  if (pool.length > totalSlots) {
    console.warn(
      `[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`
    );
  }
  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      const isVideo = image.toLowerCase().endsWith('.mp4');
      return { src: image, alt: '', type: isVideo ? 'video' : 'image' as const };
    }
    const src = image.src || '';
    const isVideo = image.type === 'video' || src.toLowerCase().endsWith('.mp4');
    return {
      src,
      alt: image.alt || '',
      type: image.type ?? (isVideo ? 'video' : 'image'),
      poster: image.poster
    };
  });
  const hasVideo = normalizedImages.some(img => img.type === 'video');
  const usedImages = hasVideo
    ? Array.from({ length: Math.min(totalSlots, normalizedImages.length) }, (_, i) => normalizedImages[i])
    : Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);
  const coordsToUse = hasVideo ? coords.slice(0, usedImages.length) : coords;
  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }
  return coordsToUse.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
    type: (usedImages[i] as any).type || 'image',
    poster: (usedImages[i] as any).poster
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

function DomeGallerySphere({
  images = [],
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#060010',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '400px',
  openedImageHeight = '400px',
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = false
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const cancelTapRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const transformFrameRef = useRef<number | null>(null);
  const pendingTransformRef = useRef<{ x: number; y: number } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const openItemDimsRef = useRef<{ naturalW: number; naturalH: number; wantsResize: boolean }>({
    naturalW: 1,
    naturalH: 1,
    wantsResize: false
  });
  const pointerTypeRef = useRef<'mouse' | 'pen' | 'touch'>('mouse');
  const tapTargetRef = useRef<HTMLElement | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const scrollLockedRef = useRef(false);
  const openItemFromElementRef = useRef<((el: HTMLElement) => void) | null>(null);
  const imageLoadStatesRef = useRef<Map<string, 'loading' | 'loaded' | 'error'>>(new Map());
  const visibleItemsRef = useRef<Set<number>>(new Set());
  const autoRotateRAF = useRef<number | null>(null);
  const autoRotateEnabledRef = useRef(true);
  const autoRotatePausedRef = useRef(false);
  const lastAutoRotateTimeRef = useRef(performance.now());

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const positionOverlay = useCallback(
    (overlay: HTMLElement) => {
      if (!mainRef.current || !frameRef.current) return;

      const frameR = frameRef.current.getBoundingClientRect();
      const mainR = mainRef.current.getBoundingClientRect();
      const { naturalW, naturalH, wantsResize } = openItemDimsRef.current;

      if (wantsResize) {
        const maxW = window.innerWidth * 0.9;
        const maxH = window.innerHeight * 0.9;
        const baseW = naturalW > 0 ? naturalW : 1;
        const baseH = naturalH > 0 ? naturalH : 1;

        let targetW = maxW;
        let targetH = (baseH / baseW) * targetW;

        if (!isFinite(targetH) || targetH <= 0) {
          targetH = maxH * 0.8;
          targetW = targetH * (16 / 9);
        }

        if (targetH > maxH) {
          targetH = maxH;
          targetW = targetH * (baseW / baseH);
        }

        if (targetW > maxW) {
          targetW = maxW;
          targetH = targetW * (baseH / baseW);
        }

        const centeredLeft = frameR.left - mainR.left + (frameR.width - targetW) / 2;
        const centeredTop = frameR.top - mainR.top + (frameR.height - targetH) / 2;

        overlay.style.width = `${targetW}px`;
        overlay.style.height = `${targetH}px`;
        overlay.style.left = `${centeredLeft}px`;
        overlay.style.top = `${centeredTop}px`;
      } else {
        overlay.style.width = `${frameR.width}px`;
        overlay.style.height = `${frameR.height}px`;
        overlay.style.left = `${frameR.left - mainR.left}px`;
        overlay.style.top = `${frameR.top - mainR.top}px`;
      }

      // Position close button if present
      if (closeButtonRef.current) {
        const finalOverlayRect = overlay.getBoundingClientRect();
        closeButtonRef.current.style.top = `${finalOverlayRect.top + 12}px`;
        closeButtonRef.current.style.right = `${window.innerWidth - finalOverlayRect.right + 12}px`;
        closeButtonRef.current.style.left = 'auto';
        closeButtonRef.current.style.opacity = '1';
      }
    },
    []
  );

  const closePreview = useCallback(() => {
    if (performance.now() - openStartedAtRef.current < 250) return;

    const el = focusedElRef.current;
    if (!el) return;

    const parent = el.parentElement as HTMLElement;
    const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement | null;
    if (!overlay) return;

    // Remove close button
    if (closeButtonRef.current) {
      closeButtonRef.current.remove();
      closeButtonRef.current = null;
    }

    // Remove close button
    const closeBtn = viewerRef.current?.querySelector('.dg-close-button') as HTMLElement | null;
    if (closeBtn) closeBtn.remove();

    const refDiv = parent.querySelector('.item__image--reference') as HTMLElement | null;
    const originalPos = originalTilePositionRef.current;

    if (!originalPos) {
      overlay.remove();
      if (refDiv) refDiv.remove();
      parent.style.setProperty('--rot-y-delta', `0deg`);
      parent.style.setProperty('--rot-x-delta', `0deg`);
      el.style.visibility = '';
      (el.style as any).zIndex = 0;
      focusedElRef.current = null;
      rootRef.current?.removeAttribute('data-enlarging');
      openingRef.current = false;
      unlockScroll();
      // Resume auto-rotation after closing
      setTimeout(() => {
        autoRotatePausedRef.current = false;
        startAutoRotate();
      }, 500);
      return;
    }

    const currentRect = overlay.getBoundingClientRect();
    const rootRect = rootRef.current!.getBoundingClientRect();

    const originalPosRelativeToRoot = {
      left: originalPos.left - rootRect.left,
      top: originalPos.top - rootRect.top,
      width: originalPos.width,
      height: originalPos.height
    };

    const overlayRelativeToRoot = {
      left: currentRect.left - rootRect.left,
      top: currentRect.top - rootRect.top,
      width: currentRect.width,
      height: currentRect.height
    };

    const animatingOverlay = document.createElement('div');
    animatingOverlay.className = 'enlarge-closing';
    animatingOverlay.style.cssText = `
      position: absolute;
      left: ${overlayRelativeToRoot.left}px;
      top: ${overlayRelativeToRoot.top}px;
      width: ${overlayRelativeToRoot.width}px;
      height: ${overlayRelativeToRoot.height}px;
      z-index: 9999;
      border-radius: ${openedImageBorderRadius};
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,.35);
      transition: all ${enlargeTransitionMs}ms ease-out;
      pointer-events: none;
      margin: 0;
      transform: none;
      filter: ${grayscale ? 'grayscale(1)' : 'none'};
    `;

    const originalImg = overlay.querySelector('img');
    const originalVid = overlay.querySelector('video');
    if (originalImg) {
      const img = originalImg.cloneNode() as HTMLImageElement;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      animatingOverlay.appendChild(img);
    } else if (originalVid) {
      const vid = originalVid.cloneNode() as HTMLVideoElement;
      vid.muted = true;
      vid.autoplay = false;
      vid.controls = false;
      vid.loop = false;
      vid.playsInline = true;
      vid.style.cssText = 'width: 100%; height: 100%; object-fit: cover; background:#000;';
      animatingOverlay.appendChild(vid);
    }

    overlay.remove();
    rootRef.current!.appendChild(animatingOverlay);

    void animatingOverlay.getBoundingClientRect();

    requestAnimationFrame(() => {
      animatingOverlay.style.left = originalPosRelativeToRoot.left + 'px';
      animatingOverlay.style.top = originalPosRelativeToRoot.top + 'px';
      animatingOverlay.style.width = originalPosRelativeToRoot.width + 'px';
      animatingOverlay.style.height = originalPosRelativeToRoot.height + 'px';
      animatingOverlay.style.opacity = '0';
    });

    const cleanup = () => {
      animatingOverlay.remove();
      originalTilePositionRef.current = null;
      if (refDiv) refDiv.remove();
      parent.style.transition = 'none';
      el.style.transition = 'none';
      parent.style.setProperty('--rot-y-delta', `0deg`);
      parent.style.setProperty('--rot-x-delta', `0deg`);

      requestAnimationFrame(() => {
        el.style.visibility = '';
        el.style.opacity = '0';
        (el.style as any).zIndex = 0;
        focusedElRef.current = null;
        rootRef.current?.removeAttribute('data-enlarging');

        requestAnimationFrame(() => {
          parent.style.transition = '';
          el.style.transition = 'opacity 300ms ease-out';

          requestAnimationFrame(() => {
            el.style.opacity = '1';

            setTimeout(() => {
              el.style.transition = '';
              el.style.opacity = '';
              openingRef.current = false;

              if (!draggingRef.current && rootRef.current?.getAttribute('data-enlarging') !== 'true') {
                document.body.classList.remove('dg-scroll-lock');
              }
              
              // Resume auto-rotation after closing animation completes
              resumeAutoRotate();
            }, 300);
          });
        });
      });
    };

    animatingOverlay.addEventListener('transitionend', cleanup, {
      once: true
    });
  }, [enlargeTransitionMs, openedImageBorderRadius, grayscale, unlockScroll]);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  // Throttle transform writes to one per frame; allow forcing immediate during inertia frames.
  const applyTransform = useCallback((xDeg: number, yDeg: number, immediate = false) => {
    if (immediate) {
      pendingTransformRef.current = null;
      if (transformFrameRef.current) {
        cancelAnimationFrame(transformFrameRef.current);
        transformFrameRef.current = null;
      }
      const el = sphereRef.current;
      if (el) {
        el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
      }
      return;
    }

    pendingTransformRef.current = { x: xDeg, y: yDeg };

    if (transformFrameRef.current) return;

    transformFrameRef.current = requestAnimationFrame(() => {
      transformFrameRef.current = null;
      const next = pendingTransformRef.current;
      pendingTransformRef.current = null;
      if (!next) return;

      const el = sphereRef.current;
      if (el) {
        el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${next.x}deg) rotateY(${next.y}deg)`;
      }
    });
  }, []);

  const lockedRadiusRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height);
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h;

      // Detect mobile devices
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

      let basis: number;
      switch (fitBasis) {
        case 'min':
          basis = minDim;
          break;
        case 'max':
          basis = maxDim;
          break;
        case 'width':
          basis = w;
          break;
        case 'height':
          basis = h;
          break;
        default:
          // Mobile: use minDim to maintain sphere appearance
          // Desktop: use width for wider screens
          basis = isMobile ? minDim : (aspect >= 1.3 ? w : minDim);
      }

      // Adjust fit multiplier for mobile to maintain similar visual appearance
      let adjustedFit = fit;
      if (isMobile) {
        // On mobile, use a slightly larger fit to maintain sphere visibility
        // This ensures the same visual appearance as desktop
        adjustedFit = fit * 1.15;
      } else if (isTablet) {
        adjustedFit = fit * 1.05;
      }

      let radius = basis * adjustedFit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      
      // Adjust min/max radius for mobile to ensure proper scaling
      // But don't restrict too much - let the sphere scale naturally
      let adjustedMinRadius = minRadius;
      let adjustedMaxRadius = maxRadius;
      if (isMobile) {
        // On mobile, scale radius limits proportionally to screen size
        // This maintains the same visual appearance while fitting the screen
        const mobileMinRadius = Math.max(minDim * 0.35, minRadius * 0.6);
        const mobileMaxRadius = Math.min(maxRadius, minDim * 0.85);
        adjustedMinRadius = mobileMinRadius;
        adjustedMaxRadius = mobileMaxRadius;
      } else if (isTablet) {
        adjustedMinRadius = Math.max(minDim * 0.45, minRadius * 0.75);
        adjustedMaxRadius = Math.min(maxRadius, minDim * 0.95);
      }
      
      radius = clamp(radius, adjustedMinRadius, adjustedMaxRadius);

      lockedRadiusRef.current = Math.round(radius);

      // Adjust viewer padding for mobile
      let adjustedPadFactor = padFactor;
      if (isMobile) {
        adjustedPadFactor = padFactor * 0.6; // Less padding on mobile
      } else if (isTablet) {
        adjustedPadFactor = padFactor * 0.8;
      }
      const viewerPad = Math.max(8, Math.round(minDim * adjustedPadFactor));

      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');

      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement;
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();
        const hasCustomSize = openedImageWidth && openedImageHeight;

        if (hasCustomSize) {
          const tempDiv = document.createElement('div');
          tempDiv.style.cssText = `position: absolute; width: ${openedImageWidth}; height: ${openedImageHeight}; visibility: hidden;`;
          document.body.appendChild(tempDiv);
          const tempRect = tempDiv.getBoundingClientRect();
          document.body.removeChild(tempDiv);

          const centeredLeft = frameR.left - mainR.left + (frameR.width - tempRect.width) / 2;
          const centeredTop = frameR.top - mainR.top + (frameR.height - tempRect.height) / 2;

          enlargedOverlay.style.left = `${centeredLeft}px`;
          enlargedOverlay.style.top = `${centeredTop}px`;
        } else {
          enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
          enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
          enlargedOverlay.style.width = `${frameR.width}px`;
          enlargedOverlay.style.height = `${frameR.height}px`;
        }
      }
    });

    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, [applyTransform]);

  // Preload first 15 images immediately for faster initial load
  useEffect(() => {
    const preloadCount = Math.min(15, items.length);
    for (let i = 0; i < preloadCount; i++) {
      const item = items[i];
      if (item.src && item.type === 'image' && !imageLoadStatesRef.current.has(item.src)) {
        imageLoadStatesRef.current.set(item.src, 'loading');
        const preloadImg = new Image();
        preloadImg.onload = () => {
          imageLoadStatesRef.current.set(item.src, 'loaded');
        };
        preloadImg.onerror = () => {
          imageLoadStatesRef.current.set(item.src, 'error');
        };
        preloadImg.src = item.src;
      }
    }
  }, [items]);

  // Progressive image loading with Intersection Observer
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement | HTMLVideoElement;
            const itemIndex = parseInt(img.getAttribute('data-item-index') || '-1', 10);
            if (itemIndex >= 0) {
              visibleItemsRef.current.add(itemIndex);
            }
          } else {
            const img = entry.target as HTMLImageElement | HTMLVideoElement;
            const itemIndex = parseInt(img.getAttribute('data-item-index') || '-1', 10);
            if (itemIndex >= 0) {
              visibleItemsRef.current.delete(itemIndex);
            }
          }
        });
      },
      {
        root: main,
        rootMargin: '100%', // Start loading when 100% away from viewport (aggressive preload)
        threshold: 0.01
      }
    );

    // Observe all images/videos after a short delay to let initial render complete
    const timeoutId = setTimeout(() => {
      const images = main.querySelectorAll('img, video');
      images.forEach((img) => observer.observe(img));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const images = main.querySelectorAll('img, video');
      images.forEach((img) => observer.unobserve(img));
      observer.disconnect();
    };
  }, [items]);

  useEffect(() => {
    const onResize = () => {
      const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement | null;
      if (overlay) {
        positionOverlay(overlay);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [positionOverlay]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  // Auto-rotation: slow continuous rotation like Earth
  const startAutoRotate = useCallback(() => {
    if (autoRotateRAF.current) return; // Already running
    if (!autoRotateEnabledRef.current) return;
    if (focusedElRef.current) return; // Don't rotate when image is open

    const ROTATION_SPEED = 0.15; // degrees per frame (very slow, like Earth)
    const TARGET_FPS = 60;
    const DEG_PER_SEC = ROTATION_SPEED * TARGET_FPS; // ~9 degrees per second

    const animate = (currentTime: number) => {
      if (!autoRotateEnabledRef.current || autoRotatePausedRef.current || focusedElRef.current) {
        autoRotateRAF.current = null;
        return;
      }

      const deltaTime = currentTime - lastAutoRotateTimeRef.current;
      lastAutoRotateTimeRef.current = currentTime;

      // Calculate rotation based on time for smooth, consistent speed
      const deltaDeg = (DEG_PER_SEC * deltaTime) / 1000;
      
      rotationRef.current.y = wrapAngleSigned(rotationRef.current.y + deltaDeg);
      applyTransform(rotationRef.current.x, rotationRef.current.y, true);

      autoRotateRAF.current = requestAnimationFrame(animate);
    };

    lastAutoRotateTimeRef.current = performance.now();
    autoRotateRAF.current = requestAnimationFrame(animate);
  }, [applyTransform]);

  const stopAutoRotate = useCallback(() => {
    if (autoRotateRAF.current) {
      cancelAnimationFrame(autoRotateRAF.current);
      autoRotateRAF.current = null;
    }
  }, []);

  const pauseAutoRotate = useCallback(() => {
    autoRotatePausedRef.current = true;
    stopAutoRotate();
  }, [stopAutoRotate]);

  const resumeAutoRotate = useCallback(() => {
    autoRotatePausedRef.current = false;
    // Resume after a short delay
    setTimeout(() => {
      if (!autoRotatePausedRef.current && !focusedElRef.current) {
        startAutoRotate();
      }
    }, 2000); // Resume after 2 seconds of no interaction
  }, [startAutoRotate]);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const isMobile = window.innerWidth < 768;
      const MAX_V = 1.4;
      // Adjust velocity multiplier for mobile - slightly less sensitive
      const velocityMultiplier = isMobile ? 70 : 80;
      let vX = clamp(vx, -MAX_V, MAX_V) * velocityMultiplier;
      let vY = clamp(vy, -MAX_V, MAX_V) * velocityMultiplier;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      // Slightly more friction on mobile for better control
      const frictionMul = isMobile ? (0.92 + 0.065 * d) : (0.94 + 0.055 * d);
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);

      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;

        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }

        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }

        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);

        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY, true);

        inertiaRAF.current = requestAnimationFrame(step);
      };

      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia]
  );

  useEffect(() => {
    return () => {
      stopInertia();
      stopAutoRotate();
      if (transformFrameRef.current) {
        cancelAnimationFrame(transformFrameRef.current);
        transformFrameRef.current = null;
      }
    };
  }, [stopInertia, stopAutoRotate]);

  // Start auto-rotation when component mounts
  useEffect(() => {
    // Small delay to let initial render complete
    const timeoutId = setTimeout(() => {
      if (!focusedElRef.current) {
        startAutoRotate();
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      stopAutoRotate();
    };
  }, [startAutoRotate, stopAutoRotate]);

  useGesture(
    {
      onDragStart: ({ event }) => {
        // Skip useGesture on mobile - use native touch handlers instead
        if (typeof window !== 'undefined' && window.innerWidth < 768) return;
        if (focusedElRef.current) return;

        pauseAutoRotate();
        stopInertia();
        if (rootRef.current) {
          rootRef.current.setAttribute('data-dragging', 'true');
        }

        const evt = event as PointerEvent | TouchEvent;
        
        // Handle both PointerEvent and TouchEvent
        // Prioritize touch events for mobile
        if ('touches' in evt && evt.touches.length > 0) {
          pointerTypeRef.current = 'touch';
          const touch = evt.touches[0];
          startPosRef.current = { x: touch.clientX, y: touch.clientY };
          evt.preventDefault();
          evt.stopPropagation();
          lockScroll();
        } else if ('changedTouches' in evt && evt.changedTouches.length > 0) {
          // Handle touchstart events
          pointerTypeRef.current = 'touch';
          const touch = evt.changedTouches[0];
          startPosRef.current = { x: touch.clientX, y: touch.clientY };
          evt.preventDefault();
          evt.stopPropagation();
          lockScroll();
        } else {
          // Pointer events (mouse/pen)
          const pointerEvt = evt as PointerEvent;
          pointerTypeRef.current = (pointerEvt.pointerType as any) || 'mouse';
          startPosRef.current = { x: pointerEvt.clientX, y: pointerEvt.clientY };
          
          if (pointerTypeRef.current === 'touch') {
            pointerEvt.preventDefault();
            pointerEvt.stopPropagation();
            lockScroll();
          }
        }

        draggingRef.current = true;
        cancelTapRef.current = false;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };

        const target = 'target' in evt ? evt.target : (evt as any).target;
        const potential = (target as Element)?.closest?.('.item__image') as HTMLElement | null;
        tapTargetRef.current = potential || null;
      },
      onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement, first }) => {
        // Skip useGesture on mobile - use native touch handlers instead
        if (typeof window !== 'undefined' && window.innerWidth < 768) return;
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;

        const evt = event as PointerEvent | TouchEvent;
        
        // Handle both PointerEvent and TouchEvent for mobile
        let clientX: number, clientY: number;
        
        // Check for touch events first (mobile)
        if ('touches' in evt && evt.touches.length > 0) {
          const touch = evt.touches[0];
          clientX = touch.clientX;
          clientY = touch.clientY;
          evt.preventDefault();
        } else if ('changedTouches' in evt && evt.changedTouches.length > 0) {
          // Fallback for touch end events
          const touch = evt.changedTouches[0];
          clientX = touch.clientX;
          clientY = touch.clientY;
          evt.preventDefault();
        } else {
          // Pointer events (mouse/pen)
          const pointerEvt = evt as PointerEvent;
          clientX = pointerEvt.clientX;
          clientY = pointerEvt.clientY;
          if (pointerTypeRef.current === 'touch') {
            pointerEvt.preventDefault();
          }
        }

        const dxTotal = clientX - startPosRef.current.x;
        const dyTotal = clientY - startPosRef.current.y;

        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) movedRef.current = true;
        }

        // Adjust drag sensitivity for mobile - slightly less sensitive for better control
        const isMobile = window.innerWidth < 768;
        const adjustedDragSensitivity = isMobile ? dragSensitivity * 1.2 : dragSensitivity;

        const nextX = clamp(
          startRotRef.current.x - dyTotal / adjustedDragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const nextY = startRotRef.current.y + dxTotal / adjustedDragSensitivity;

        const cur = rotationRef.current;

        if (cur.x !== nextX || cur.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }

        if (last) {
          draggingRef.current = false;
          rootRef.current?.removeAttribute('data-dragging');

          let isTap = false;
          if (startPosRef.current) {
            // Get final position from event
            let finalX: number, finalY: number;
            if ('touches' in evt && evt.touches.length > 0) {
              finalX = evt.touches[0].clientX;
              finalY = evt.touches[0].clientY;
            } else if ('changedTouches' in evt && evt.changedTouches.length > 0) {
              // Handle touch end event
              finalX = evt.changedTouches[0].clientX;
              finalY = evt.changedTouches[0].clientY;
            } else {
              const pointerEvt = evt as PointerEvent;
              finalX = pointerEvt.clientX;
              finalY = pointerEvt.clientY;
            }
            
            const dx = finalX - startPosRef.current.x;
            const dy = finalY - startPosRef.current.y;
            const dist2 = dx * dx + dy * dy;
            const TAP_THRESH_PX = pointerTypeRef.current === 'touch' ? 10 : 6;

            if (dist2 <= TAP_THRESH_PX * TAP_THRESH_PX) {
              isTap = true;
            }
          }

          let [vMagX, vMagY] = velArr;
          const [dirX, dirY] = dirArr;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;

          if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            const [mx, my] = movement;
            vx = (mx / dragSensitivity) * 0.02;
            vy = (my / dragSensitivity) * 0.02;
          }

          if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) {
            startInertia(vx, vy);
          }

          startPosRef.current = null;
          cancelTapRef.current = !isTap;

          if (isTap && tapTargetRef.current && !focusedElRef.current) {
            openItemFromElement(tapTargetRef.current);
          }

          tapTargetRef.current = null;
          if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);

          if (pointerTypeRef.current === 'touch') unlockScroll();

          if (movedRef.current) lastDragEndAt.current = performance.now();

          movedRef.current = false;
          
          // Resume auto-rotation after user interaction
          resumeAutoRotate();
        }
      }
    },
    { 
      target: mainRef, 
      eventOptions: { passive: false }
    }
  );

  // Unified pointer handlers (works for touch + mouse). This replaces touch-specific paths.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    // Touch-only handlers to guarantee mobile swipe works
    let touchActive = false;
    let tStartX = 0;
    let tStartY = 0;
    let tLastX = 0;
    let tLastY = 0;
    let tLastTime = 0;
    let tStartRot = { x: 0, y: 0 };
    let touchedImageEl: HTMLElement | null = null;
    let hasMoved = false;

    const onTouchStart = (e: TouchEvent) => {
      if (focusedElRef.current) return;
      if (e.touches.length === 0) return;
      
      const target = e.target as HTMLElement;
      // Track which image was touched for potential tap handling
      touchedImageEl = target.closest('.item__image') as HTMLElement | null;

      pauseAutoRotate();
      stopInertia();
      touchActive = true;
      hasMoved = false;
      const touch = e.touches[0];
      tStartX = touch.clientX;
      tStartY = touch.clientY;
      tLastX = tStartX;
      tLastY = tStartY;
      tLastTime = performance.now();
      tStartRot = { ...rotationRef.current };
      draggingRef.current = true;
      pointerTypeRef.current = 'touch';
      rootRef.current?.setAttribute('data-dragging', 'true');
      lockScroll();
      e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive || !draggingRef.current) return;
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - tStartX;
      const dy = touch.clientY - tStartY;
      
      // Check if movement exceeds tap threshold
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 10) {
        hasMoved = true;
      }
      
      const adjusted = dragSensitivity * 1.2;
      const nextX = clamp(tStartRot.x - dy / adjusted, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = tStartRot.y + dx / adjusted;
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY, true);
      tLastX = touch.clientX;
      tLastY = touch.clientY;
      tLastTime = performance.now();
      e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchActive) return;
      touchActive = false;
      draggingRef.current = false;
      rootRef.current?.removeAttribute('data-dragging');
      
      // Calculate total movement distance
      const dx = tLastX - tStartX;
      const dy = tLastY - tStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const TAP_THRESHOLD = 10; // pixels
      
      // If minimal movement and touched an image, treat as tap to open
      if (dist < TAP_THRESHOLD && !hasMoved && touchedImageEl && !openingRef.current) {
        openItemFromElementRef.current?.(touchedImageEl);
      } else if (hasMoved) {
        // It was a swipe - apply inertia
        const now = performance.now();
        const dt = Math.max(now - tLastTime, 16);
        const vx = (dx / dt) * 0.2;
        const vy = (dy / dt) * 0.2;
        if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
          startInertia(vx, vy);
        }
      }
      
      touchedImageEl = null;
      hasMoved = false;
      unlockScroll();
      
      // Resume auto-rotation after touch interaction
      resumeAutoRotate();
      
      e.preventDefault();
    };

    main.addEventListener('touchstart', onTouchStart, { passive: false });
    main.addEventListener('touchmove', onTouchMove, { passive: false });
    main.addEventListener('touchend', onTouchEnd, { passive: false });
    main.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      main.removeEventListener('touchstart', onTouchStart);
      main.removeEventListener('touchmove', onTouchMove);
      main.removeEventListener('touchend', onTouchEnd);
      main.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [stopInertia, lockScroll, unlockScroll, dragSensitivity, maxVerticalRotationDeg, applyTransform, startInertia]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let startRotation = { x: 0, y: 0 };
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let activePointerId: number | null = null;

    const isTouchLike = (e: PointerEvent) => e.pointerType === 'touch' || e.pointerType === 'pen';

    const onPointerDown = (e: PointerEvent) => {
      // Let touch be handled by dedicated touch handlers
      if (e.pointerType === 'touch') return;
      if (focusedElRef.current) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const target = e.target as HTMLElement;
      if (target.closest('.item__image')) return;

      pauseAutoRotate();
      stopInertia();
      isPointerDown = true;
      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      lastX = startX;
      lastY = startY;
      startRotation = { ...rotationRef.current };
      lastTime = performance.now();
      draggingRef.current = true;
      pointerTypeRef.current = (e.pointerType as any) || 'mouse';

      if (rootRef.current) {
        rootRef.current.setAttribute('data-dragging', 'true');
      }

      try {
        main.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      if (pointerTypeRef.current === 'touch') {
        lockScroll();
      }

      e.preventDefault();
      e.stopPropagation();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!isPointerDown || activePointerId === null || e.pointerId !== activePointerId) return;
      if (!draggingRef.current || focusedElRef.current) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const isMobileDrag = isTouchLike(e);
      const adjustedDragSensitivity = isMobileDrag ? dragSensitivity * 1.2 : dragSensitivity;

      const nextX = clamp(
        startRotation.x - dy / adjustedDragSensitivity,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg
      );
      const nextY = startRotation.y + dx / adjustedDragSensitivity;

      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY, true);

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();

      if (pointerTypeRef.current === 'touch') {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!isPointerDown || activePointerId === null || e.pointerId !== activePointerId) return;

      isPointerDown = false;
      activePointerId = null;
      draggingRef.current = false;

      if (rootRef.current) {
        rootRef.current.removeAttribute('data-dragging');
      }

      const now = performance.now();
      const dt = Math.max(now - lastTime, 16);
      const vx = ((e.clientX - lastX) / dt) * 0.2;
      const vy = ((e.clientY - lastY) / dt) * 0.2;

      if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
        startInertia(vx, vy);
      }

      unlockScroll();

      // Resume auto-rotation after pointer interaction
      resumeAutoRotate();

      try {
        main.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      if (pointerTypeRef.current === 'touch') {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      isPointerDown = false;
      activePointerId = null;
      draggingRef.current = false;
      if (rootRef.current) {
        rootRef.current.removeAttribute('data-dragging');
      }
      unlockScroll();
    };

    main.addEventListener('pointerdown', onPointerDown, { passive: false });
    main.addEventListener('pointermove', onPointerMove, { passive: false });
    main.addEventListener('pointerup', onPointerUp, { passive: false });
    main.addEventListener('pointercancel', onPointerCancel, { passive: false });

    return () => {
      main.removeEventListener('pointerdown', onPointerDown);
      main.removeEventListener('pointermove', onPointerMove);
      main.removeEventListener('pointerup', onPointerUp);
      main.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [stopInertia, lockScroll, unlockScroll, dragSensitivity, maxVerticalRotationDeg, applyTransform, startInertia]);

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;

    scrim.addEventListener('click', closePreview);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
    };

    window.addEventListener('keydown', onKey);

    return () => {
      scrim.removeEventListener('click', closePreview);
      window.removeEventListener('keydown', onKey);
    };
  }, [closePreview]);

  const openItemFromElement = (el: HTMLElement) => {
    if (openingRef.current) return;

    openingRef.current = true;
    openStartedAtRef.current = performance.now();

    // Pause auto-rotation when opening an image
    pauseAutoRotate();
    lockScroll();

    const parent = el.parentElement as HTMLElement;
    focusedElRef.current = el;
    el.setAttribute('data-focused', 'true');

    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);

    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);

    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotationRef.current.y);

    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;

    const rotX = -parentRot.rotateX - rotationRef.current.x;

    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference opacity-0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);

    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef.current?.getBoundingClientRect();
    const frameR = frameRef.current?.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      openingRef.current = false;
      focusedElRef.current = null;
      parent.removeChild(refDiv);
      unlockScroll();
      return;
    }

    originalTilePositionRef.current = {
      left: tileR.left,
      top: tileR.top,
      width: tileR.width,
      height: tileR.height
    };

    el.style.visibility = 'hidden';
    (el.style as any).zIndex = 0;

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.cssText = `position:absolute; left:${frameR.left - mainR.left}px; top:${frameR.top - mainR.top}px; width:${frameR.width}px; height:${frameR.height}px; opacity:0; z-index:30; will-change:transform,opacity; transform-origin:top left; transition:transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease; border-radius:${openedImageBorderRadius}; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.35);`;

    const rawSrc = parent.dataset.src || (el.querySelector('img') as HTMLImageElement)?.src || '';
    const rawAlt = parent.dataset.alt || (el.querySelector('img') as HTMLImageElement)?.alt || '';

    const itemType = (parent.dataset.type as 'image' | 'video') || 'image';
    const poster = parent.dataset.poster || '';

    let naturalW = 1;
    let naturalH = 1;

    // Create close button - positioned outside overlay to avoid clipping
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'dg-close-button';
    closeButton.setAttribute('aria-label', 'Close preview');
    closeButton.style.cssText = `
      position: fixed;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.4);
      font-size: 30px;
      font-weight: bold;
      line-height: 1;
      cursor: pointer;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      pointer-events: auto;
      opacity: 0;
    `;
    closeButton.onmouseenter = () => {
      closeButton.style.background = 'rgba(220, 38, 38, 0.95)';
      closeButton.style.borderColor = 'rgba(255, 255, 255, 0.6)';
      closeButton.style.transform = 'scale(1.1)';
    };
    closeButton.onmouseleave = () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.8)';
      closeButton.style.borderColor = 'rgba(255, 255, 255, 0.4)';
      closeButton.style.transform = 'scale(1)';
    };
    closeButton.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      closePreview();
    };
    // Append to viewerRef instead of overlay to ensure it's always visible
    closeButtonRef.current = closeButton;
    viewerRef.current!.appendChild(closeButton);

    if (itemType === 'video') {
      const video = document.createElement('video');
      video.src = rawSrc;
      video.poster = poster;
      video.playsInline = true;
      video.controls = true;
      video.muted = true;
      video.autoplay = true;
      video.loop = false;
      video.preload = 'auto';
      video.style.cssText = `width:100%; height:100%; object-fit:contain; background:#000;`;
      naturalW = (el.querySelector('video') as HTMLVideoElement)?.videoWidth || 16;
      naturalH = (el.querySelector('video') as HTMLVideoElement)?.videoHeight || 9;
      overlay.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = rawSrc;
      img.alt = rawAlt;
      img.style.cssText = `width:100%; height:100%; object-fit:contain; background:#000; filter:${grayscale ? 'grayscale(1)' : 'none'};`;
      naturalW = (el.querySelector('img') as HTMLImageElement)?.naturalWidth || 1;
      naturalH = (el.querySelector('img') as HTMLImageElement)?.naturalHeight || 1;
      overlay.appendChild(img);
    }
    viewerRef.current!.appendChild(overlay);
    openItemDimsRef.current = { naturalW, naturalH, wantsResize: Boolean(openedImageWidth || openedImageHeight) };

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;

    const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
    const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

    setTimeout(() => {
      if (!overlay.parentElement) return;

      positionOverlay(overlay);

      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';

      rootRef.current?.setAttribute('data-enlarging', 'true');
    }, 16);
  };

  // Keep ref updated so touch handlers can access latest version
  openItemFromElementRef.current = openItemFromElement;

  useEffect(() => {
    return () => {
      document.body.classList.remove('dg-scroll-lock');
    };
  }, []);

  const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    
    .sphere-root * { box-sizing: border-box; }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
    }
    
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
    }
    
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 300ms;
      will-change: transform;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) 
                 translateZ(var(--radius));
    }
    .sphere-root[data-dragging="true"] .sphere-item,
    .sphere-root[data-dragging="true"] .item__image {
      transition: none !important;
    }
    
    .sphere-root[data-enlarging="true"] .scrim {
      opacity: 1 !important;
      pointer-events: all !important;
    }
    
    @media (max-aspect-ratio: 1/1) {
      .viewer-frame {
        height: auto !important;
        width: 100% !important;
      }
    }
    
    /* Mobile responsiveness - maintain same layout as desktop */
    @media (max-width: 767px) {
      .sphere-root {
        width: 100% !important;
        height: 100% !important;
        touch-action: none !important;
        -webkit-touch-callout: none !important;
      }
      
      .stage {
        width: 100% !important;
        height: 100% !important;
        perspective: calc(var(--radius) * 2) !important;
        touch-action: none !important;
      }
      
      .sphere {
        transform: translateZ(calc(var(--radius) * -1)) !important;
        touch-action: none !important;
      }
      
      .viewer-frame {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        touch-action: none !important;
      }
      
      /* Ensure images scale properly on mobile */
      .item__image {
        inset: 8px !important;
        touch-action: none !important;
        pointer-events: auto !important;
      }
      
      /* Better touch targets on mobile */
      .item__image {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent !important;
        touch-action: none !important;
      }
      
      /* Main container - critical for touch events */
      .sphere-root > main {
        touch-action: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
        pointer-events: auto !important;
      }
      
      /* Close button adjustments for mobile */
      .dg-close-button {
        width: 40px !important;
        height: 40px !important;
        font-size: 28px !important;
        top: 8px !important;
        right: 8px !important;
        touch-action: auto !important;
      }
    }
    
    /* Tablet adjustments */
    @media (min-width: 768px) and (max-width: 1024px) {
      .item__image {
        inset: 10px;
      }
    }
    
    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 300ms;
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      will-change: transform;
    }
    .item__image--reference {
      position: absolute;
      inset: 10px;
      pointer-events: none;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div
        ref={rootRef}
        className="sphere-root relative w-full h-full"
        style={
          {
            ['--segments-x' as any]: segments,
            ['--segments-y' as any]: segments,
            ['--overlay-blur-color' as any]: overlayBlurColor,
            ['--tile-radius' as any]: imageBorderRadius,
            ['--enlarge-radius' as any]: openedImageBorderRadius,
            ['--image-filter' as any]: grayscale ? 'grayscale(1)' : 'none'
          } as React.CSSProperties
        }
      >
        <main
          ref={mainRef}
          className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
          style={{
            touchAction: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            userSelect: 'none',
            // Ensure touch events work on mobile
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="sphere-item absolute m-auto"
                  data-src={it.src}
                  data-alt={it.alt}
                  data-type={it.type}
                  data-poster={it.poster || ''}
                  data-offset-x={it.x}
                  data-offset-y={it.y}
                  data-size-x={it.sizeX}
                  data-size-y={it.sizeY}
                  style={
                    {
                      ['--offset-x' as any]: it.x,
                      ['--offset-y' as any]: it.y,
                      ['--item-size-x' as any]: it.sizeX,
                      ['--item-size-y' as any]: it.sizeY,
                      top: '-999px',
                      bottom: '-999px',
                      left: '-999px',
                      right: '-999px'
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="item__image absolute block overflow-hidden cursor-pointer bg-gray-200 transition-transform duration-300"
                    role="button"
                    tabIndex={0}
                    aria-label={it.alt || (it.type === 'video' ? 'Open video' : 'Open image')}
                    onClick={e => {
                      if (draggingRef.current) return;
                      if (movedRef.current) return;
                      if (performance.now() - lastDragEndAt.current < 80) return;
                      if (openingRef.current) return;
                      openItemFromElement(e.currentTarget as HTMLElement);
                    }}
                    onPointerUp={e => {
                      if ((e.nativeEvent as PointerEvent).pointerType !== 'touch') return;
                      if (draggingRef.current) return;
                      if (movedRef.current) return;
                      if (performance.now() - lastDragEndAt.current < 80) return;
                      if (openingRef.current) return;
                      openItemFromElement(e.currentTarget as HTMLElement);
                    }}
                    style={{
                      inset: '10px',
                      borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {it.type === 'video' ? (
                      <video
                        src={it.src}
                        poster={it.poster}
                        className="w-full h-full object-cover pointer-events-none"
                        muted
                        loop={false}
                        playsInline
                        autoPlay={false}
                        preload="none"
                        data-item-index={i}
                        style={{
                          backfaceVisibility: 'hidden',
                          filter: `var(--image-filter, ${grayscale ? 'grayscale(1)' : 'none'})`,
                          backgroundColor: '#000'
                        }}
                      />
                    ) : (
                      <>
                        {/* Loading placeholder - shows while image loads */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900"
                          data-placeholder={`placeholder-${i}`}
                          style={{
                            zIndex: 1,
                            transition: 'opacity 0.3s ease-in-out'
                          }}
                        />
                        <img
                          src={it.src}
                          draggable={false}
                          alt={it.alt}
                          loading={i < 20 ? "eager" : "lazy"}
                          decoding="async"
                          fetchpriority={i < 10 ? "high" : i < 20 ? "auto" : "low"}
                          data-item-index={i}
                          className="w-full h-full object-cover pointer-events-none"
                          style={{
                            backfaceVisibility: 'hidden',
                            filter: `var(--image-filter, ${grayscale ? 'grayscale(1)' : 'none'})`,
                            opacity: 0,
                            transition: 'opacity 0.3s ease-in-out',
                            position: 'relative',
                            zIndex: 2
                          }}
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            img.style.opacity = '1';
                            const placeholder = img.parentElement?.querySelector(`[data-placeholder="placeholder-${i}"]`) as HTMLElement;
                            if (placeholder) {
                              placeholder.style.opacity = '0';
                              setTimeout(() => {
                                if (placeholder.parentElement) {
                                  placeholder.style.display = 'none';
                                }
                              }, 300);
                            }
                            imageLoadStatesRef.current.set(it.src, 'loaded');
                          }}
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.opacity = '1';
                            const placeholder = img.parentElement?.querySelector(`[data-placeholder="placeholder-${i}"]`) as HTMLElement;
                            if (placeholder) {
                              placeholder.style.opacity = '0';
                              setTimeout(() => {
                                if (placeholder.parentElement) {
                                  placeholder.style.display = 'none';
                                }
                              }, 300);
                            }
                            imageLoadStatesRef.current.set(it.src, 'error');
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={viewerRef}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            style={{ padding: 'var(--viewer-pad)' }}
          >
            <div
              ref={scrimRef}
              className="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(3px)'
              }}
            />
            <div
              ref={frameRef}
              className="viewer-frame h-full aspect-square flex"
              style={{
                borderRadius: `var(--enlarge-radius, ${openedImageBorderRadius})`
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}

type MobileMediaItem = {
  src: string;
  alt: string;
  type: 'image' | 'video';
  poster?: string;
};

function normalizeMobileMedia(images: ImageItem[]): MobileMediaItem[] {
  return (images ?? []).map((image) => {
    if (typeof image === 'string') {
      const isVideo = image.toLowerCase().endsWith('.mp4');
      const type: MobileMediaItem['type'] = isVideo ? 'video' : 'image';
      return { src: image, alt: '', type };
    }
    const src = image.src || '';
    const isVideo = image.type === 'video' || src.toLowerCase().endsWith('.mp4');
    return {
      src,
      alt: image.alt || '',
      type: image.type ?? (isVideo ? 'video' : 'image'),
      poster: image.poster
    };
  }).filter(m => Boolean(m.src));
}

function DomeGalleryMobile({
  images = [],
  imageBorderRadius = '20px',
  openedImageBorderRadius = '20px',
  grayscale = false
}: DomeGalleryProps) {
  const media = useMemo(() => normalizeMobileMedia(images), [images]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const useDots = media.length <= 9;

  useEffect(() => {
    if (openIndex == null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex]);

  useEffect(() => {
    if (openIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex]);

  const css = `
    .dg-mobile { width: 100%; height: 100%; }
    .dg-mobile-track-wrap { position: relative; }
    .dg-mobile-track {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      padding: 8px 6px;
      touch-action: pan-x;
    }
    .dg-mobile-edge {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 44px;
      pointer-events: none;
      z-index: 2;
    }
    .dg-mobile-edge-left {
      left: 0;
      background: linear-gradient(90deg, rgba(0,0,0,.42), rgba(0,0,0,0));
    }
    .dg-mobile-edge-right {
      right: 0;
      background: linear-gradient(270deg, rgba(0,0,0,.42), rgba(0,0,0,0));
    }
    .dg-mobile-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 8px 12px;
      width: fit-content;
      margin: 10px auto 2px;
      border-radius: 999px;
      background: rgba(0,0,0,.38);
      border: 1px solid rgba(255,255,255,.14);
      backdrop-filter: blur(6px);
      pointer-events: auto;
    }
    .dg-mobile-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      border: 0;
      padding: 0;
      background: rgba(255,255,255,.28);
      box-shadow: 0 0 0 1px rgba(0,0,0,.15);
      transition: transform 160ms ease, background 160ms ease, opacity 160ms ease;
      opacity: .9;
      cursor: pointer;
    }
    .dg-mobile-dot[data-active="true"] {
      background: rgba(255,255,255,.88);
      transform: scale(1.25);
      opacity: 1;
    }
    .dg-mobile-indicator {
      display: grid;
      justify-items: center;
      gap: 8px;
      padding: 10px 0 2px;
      pointer-events: auto;
    }
    .dg-mobile-swipe-pill {
      font-size: 12px;
      letter-spacing: .02em;
      color: rgba(255,255,255,.92);
      background: rgba(0,0,0,.42);
      border: 1px solid rgba(255,255,255,.14);
      border-radius: 999px;
      padding: 6px 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(6px);
      user-select: none;
      -webkit-user-select: none;
    }
    .dg-mobile-swipe-pill .arrow {
      display: inline-block;
      opacity: .9;
      transform: translateX(0);
      animation: dg-swipe-nudge 1.2s ease-in-out infinite;
    }
    @keyframes dg-swipe-nudge {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(6px); }
    }
    .dg-mobile-progress {
      width: min(72vw, 420px);
      height: 6px;
      border-radius: 999px;
      background: rgba(255,255,255,.14);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: 0 6px 18px rgba(0,0,0,.22);
    }
    .dg-mobile-progress-fill {
      height: 100%;
      width: 100%;
      transform-origin: 0 50%;
      background: linear-gradient(90deg, rgba(255,255,255,.92), rgba(255,255,255,.55));
    }
    .dg-mobile-count {
      font-size: 12px;
      color: rgba(255,255,255,.78);
      user-select: none;
      -webkit-user-select: none;
    }
    .dg-mobile-card {
      flex: 0 0 min(82vw, 420px);
      scroll-snap-align: center;
      border-radius: ${imageBorderRadius};
      overflow: hidden;
      background: #0b0b0f;
      aspect-ratio: 1 / 1;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
    }
    .dg-mobile-card {
      position: relative;
    }
    .dg-mobile-card > img, .dg-mobile-card > video {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      filter: ${grayscale ? 'grayscale(1)' : 'none'};
      background: #000;
    }
    .dg-mobile-card > img {
      position: relative;
      z-index: 2;
    }
    .dg-mobile-modal {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0,0,0,.7);
      backdrop-filter: blur(6px);
      display: grid;
      place-items: center;
      padding: 18px;
    }
    .dg-mobile-modal-inner {
      width: min(92vw, 720px);
      max-height: 82vh;
      border-radius: ${openedImageBorderRadius};
      overflow: hidden;
      background: #000;
      box-shadow: 0 20px 60px rgba(0,0,0,.55);
      position: relative;
    }
    .dg-mobile-modal-inner > img, .dg-mobile-modal-inner > video {
      width: 100%;
      height: 100%;
      max-height: 82vh;
      object-fit: contain;
      display: block;
      background: #000;
      filter: ${grayscale ? 'grayscale(1)' : 'none'};
    }
    .dg-mobile-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: rgba(0,0,0,.75);
      color: #fff;
      border: 1px solid rgba(255,255,255,.25);
      font-size: 28px;
      line-height: 1;
      display: grid;
      place-items: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
  `;

  if (media.length === 0) {
    return <div className="w-full h-full" />;
  }

  const open = openIndex != null ? media[openIndex] : null;
  const progress = media.length <= 1 ? 1 : (activeIndex + 1) / media.length;

  const scrollToIndex = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const el = track.children.item(idx) as HTMLElement | null;
    if (!el) return;
    const left = el.offsetLeft - (track.clientWidth - el.clientWidth) / 2;
    track.scrollTo({ left, behavior: 'smooth' });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="dg-mobile">
        <div className="dg-mobile-track-wrap">
          <div
            ref={trackRef}
            className="dg-mobile-track"
            aria-label="Gallery"
            role="list"
            onScroll={() => {
              const track = trackRef.current;
              if (!track) return;
              // rAF throttle (iOS-friendly)
              const anyTrack = track as any;
              if (anyTrack.__dgRaf) return;
              anyTrack.__dgRaf = requestAnimationFrame(() => {
                anyTrack.__dgRaf = null;
                const centerX = track.scrollLeft + track.clientWidth / 2;
                let bestIdx = 0;
                let bestDist = Infinity;
                for (let i = 0; i < track.children.length; i++) {
                  const child = track.children.item(i) as HTMLElement;
                  const childCenter = child.offsetLeft + child.clientWidth / 2;
                  const d = Math.abs(childCenter - centerX);
                  if (d < bestDist) {
                    bestDist = d;
                    bestIdx = i;
                  }
                }
                setActiveIndex(bestIdx);
              });
            }}
          >
            {media.map((m, idx) => (
              <button
                key={`${m.src}-${idx}`}
                type="button"
                className="dg-mobile-card"
                onClick={() => setOpenIndex(idx)}
                aria-label={m.alt || (m.type === 'video' ? 'Open video' : 'Open image')}
              >
                {m.type === 'video' ? (
                  <video src={m.src} poster={m.poster} muted playsInline preload="none" />
                ) : (
                  <>
                    {/* Loading placeholder for mobile */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900"
                      style={{
                        zIndex: 1,
                        transition: 'opacity 0.3s ease-in-out'
                      }}
                      data-mobile-placeholder={`mobile-${idx}`}
                    />
                    <img
                      src={m.src}
                      alt={m.alt}
                      loading={idx < 3 ? "eager" : "lazy"}
                      decoding="async"
                      fetchpriority={idx < 3 ? "high" : "low"}
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.3s ease-in-out',
                        position: 'relative',
                        zIndex: 2
                      }}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        img.style.opacity = '1';
                        const placeholder = img.parentElement?.querySelector(`[data-mobile-placeholder="mobile-${idx}"]`) as HTMLElement;
                        if (placeholder) {
                          placeholder.style.opacity = '0';
                          setTimeout(() => {
                            if (placeholder.parentElement) {
                              placeholder.style.display = 'none';
                            }
                          }, 300);
                        }
                      }}
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.opacity = '1';
                        const placeholder = img.parentElement?.querySelector(`[data-mobile-placeholder="mobile-${idx}"]`) as HTMLElement;
                        if (placeholder) {
                          placeholder.style.opacity = '0';
                          setTimeout(() => {
                            if (placeholder.parentElement) {
                              placeholder.style.display = 'none';
                            }
                          }, 300);
                        }
                      }}
                    />
                  </>
                )}
              </button>
            ))}
          </div>
          <div className="dg-mobile-edge dg-mobile-edge-left" aria-hidden="true" />
          <div className="dg-mobile-edge dg-mobile-edge-right" aria-hidden="true" />
        </div>

        {useDots ? (
          <div className="dg-mobile-dots" aria-label="Swipe indicators" role="tablist">
            {media.map((m, idx) => (
              <button
                key={`dot-${m.src}-${idx}`}
                type="button"
                className="dg-mobile-dot"
                data-active={idx === activeIndex ? 'true' : 'false'}
                aria-label={`Go to item ${idx + 1} of ${media.length}`}
                aria-current={idx === activeIndex ? 'true' : undefined}
                onClick={() => scrollToIndex(idx)}
              />
            ))}
          </div>
        ) : (
          <div className="dg-mobile-indicator" aria-label="Swipe to explore indicator">
            <div className="dg-mobile-swipe-pill">
              Swipe to explore <span className="arrow">→</span>
            </div>
            <div
              className="dg-mobile-progress"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={media.length}
              aria-valuenow={activeIndex + 1}
            >
              <div className="dg-mobile-progress-fill" style={{ transform: `scaleX(${progress})` }} />
            </div>
            <div className="dg-mobile-count">
              {activeIndex + 1} / {media.length}
            </div>
          </div>
        )}

        {open && (
          <div className="dg-mobile-modal" onClick={() => setOpenIndex(null)} role="dialog" aria-modal="true">
            <div className="dg-mobile-modal-inner" onClick={(e) => e.stopPropagation()}>
              <button className="dg-mobile-close" type="button" onClick={() => setOpenIndex(null)} aria-label="Close">
                ×
              </button>
              {open.type === 'video' ? (
                <video src={open.src} poster={open.poster} controls playsInline autoPlay />
              ) : (
                <img src={open.src} alt={open.alt} decoding="async" />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DomeGallery(props: DomeGalleryProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener?.('change', update);
    return () => mql.removeEventListener?.('change', update);
  }, []);

  return isMobile ? <DomeGalleryMobile {...props} /> : <DomeGallerySphere {...props} />;
}

export default DomeGallery;
