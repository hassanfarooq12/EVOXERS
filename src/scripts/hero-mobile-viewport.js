/* JS Hook - Mobile Hero Viewport & Animation Support */
(function() {
  'use strict';
  
  // Calculate --vh for mobile viewport (avoids address bar issues)
  function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  // Initial set
  setViewportHeight();
  
  // Recalculate on resize and orientation change
  let resizeTimer;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      setViewportHeight();
      // Trigger reflow for animation repositioning
      if (window.EvoxHero && typeof window.EvoxHero.refresh === 'function') {
        window.EvoxHero.refresh();
      }
    }, 150);
  }
  
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      setViewportHeight();
      if (window.EvoxHero && typeof window.EvoxHero.refresh === 'function') {
        window.EvoxHero.refresh();
      }
    }, 100);
  }, { passive: true });
  
  // Expose refresh function for animation code
  window.EvoxHero = window.EvoxHero || {};
  window.EvoxHero.refresh = function() {
    setViewportHeight();
    // Trigger safe reflow without restarting animation
    const hero = document.querySelector('.evox-hero-responsive');
    if (hero) {
      hero.style.display = 'none';
      hero.offsetHeight; // Force reflow
      hero.style.display = '';
    }
  };
  
  // Handle keyboard visibility on mobile (iOS/Android)
  if ('visualViewport' in window) {
    const viewport = window.visualViewport;
    viewport.addEventListener('resize', function() {
      setViewportHeight();
      if (window.EvoxHero && typeof window.EvoxHero.refresh === 'function') {
        window.EvoxHero.refresh();
      }
    }, { passive: true });
  }
})();

