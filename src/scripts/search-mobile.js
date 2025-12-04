/* JS Hook - Mobile Search Overlay */
(function() {
  'use strict';
  
  // Feature detection
  const hasExistingSearch = typeof window !== 'undefined' && document.querySelector('[data-search-command]');
  if (!hasExistingSearch) return;
  
  const searchOverlay = document.querySelector('.evox-search');
  const searchInput = document.querySelector('.evox-search-input');
  const searchCancel = document.querySelector('.evox-search-cancel');
  const searchTrigger = document.querySelector('[aria-label*="Search"], [aria-label*="search"]');
  
  if (!searchOverlay || !searchInput || !searchCancel) return;
  
  // Toggle overlay
  function toggleSearch(open) {
    if (open) {
      searchOverlay.classList.add('open');
      setTimeout(() => {
        searchInput.focus();
        searchInput.setAttribute('aria-expanded', 'true');
      }, 100);
    } else {
      searchOverlay.classList.remove('open');
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.blur();
    }
  }
  
  // Open search when trigger clicked
  if (searchTrigger) {
    searchTrigger.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        toggleSearch(true);
      }
    });
  }
  
  // Close on cancel button
  searchCancel.addEventListener('click', function() {
    // Try to use existing close function if available
    if (typeof window.evoxCloseSearch === 'function') {
      window.evoxCloseSearch();
    } else if (typeof window.onSearchClose === 'function') {
      window.onSearchClose();
    } else {
      // Fallback: navigate to home
      toggleSearch(false);
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  });
  
  // Close on backdrop click
  const backdrop = searchOverlay.querySelector('.evox-search-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function() {
      toggleSearch(false);
    });
  }
  
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
      toggleSearch(false);
    }
  });
  
  // Expose toggle function globally for integration
  window.evoxToggleSearch = toggleSearch;
})();

