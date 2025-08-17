(function() {
  'use strict';

  // Wait for the rating service to be available
  function waitForRatingService() {
    return new Promise((resolve) => {
      if (window.ratingService && window.ratingDisplay) {
        resolve();
      } else {
        setTimeout(() => waitForRatingService().then(resolve), 100);
      }
    });
  }

  function extractHotstarTitle(element) {
    // If the tile is a link or actionable container, try its aria-label or title first
    if (element.tagName === 'A') {
      const linkLabel = element.getAttribute('aria-label') || element.getAttribute('title');
      if (linkLabel && linkLabel.trim()) return (linkLabel.split(',')[0] || linkLabel).trim();
    }

    // Common Hotstar structure has an inner [data-testid="action"] with aria-label like "Title,Show"
    const actionEl = element.querySelector('[data-testid="action"]');
    if (actionEl) {
      const label = actionEl.getAttribute('aria-label') || actionEl.getAttribute('title');
      if (label && label.trim()) {
        return (label.split(',')[0] || label).trim();
      }
    }

    // Try different selectors for Hotstar title extraction
    const titleSelectors = [
      '[data-testid="title"]',
      '[data-testid="content-title"]',
      '[data-testid="tray-card-default"] [aria-label]',
      '.content-info h3',
      '.content-info h2',
      '.content-title',
      '.title',
      '.card-title',
      '.video-title',
      'h3.title',
      '.content-meta .title',
      '.poster-title',
      'img[alt]:not([alt=""])'
    ];

    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement) {
        // Prefer aria-label if present
        const aria = titleElement.getAttribute && (titleElement.getAttribute('aria-label') || titleElement.getAttribute('title'));
        if (aria && aria.trim()) {
          return (aria.split(',')[0] || aria).trim();
        }

        let title = '';
        if (titleElement.tagName === 'IMG' && titleElement.alt) {
          title = titleElement.alt;
        } else {
          title = titleElement.textContent || titleElement.innerText;
        }
        
        if (title && title.trim()) {
          return title.trim();
        }
      }
    }

    // Try aria-label as fallback on the container
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return (ariaLabel.split(',')[0] || ariaLabel).trim();
    }

    // Try title attribute as fallback
    const titleAttr = element.getAttribute('title');
    if (titleAttr && titleAttr.trim()) {
      return titleAttr.trim();
    }

    // Try data attributes that might contain the title
    const dataTitle = element.getAttribute('data-title');
    if (dataTitle && dataTitle.trim()) {
      return dataTitle.trim();
    }

    return null;
  }

  function getHotstarSelectors() {
    return [
      '[data-testid="tray-card-default"]', // Hotstar tray vertical/horizontal cards
      '[data-testid="grid-item"]',
      '[data-testid="list-item"]',
      '[data-testid="content-card"]',
      '[data-testid="item-container"]',
      '[data-testid="hs-image"]', // image wrapper
      'a[href*="/in/movies/"], a[href*="/in/tv/"], a[href*="/in/shows/"], a[href*="/in/sports/"]',
      '.content-card', // Main content cards
      '.poster-container', // Poster containers
      '.video-card', // Video cards
      '.content-item', // Content items
      '.carousel-item', // Carousel items
      '.grid-item', // Grid items
      '.card', // Generic cards
      '.tile', // Tiles
      '.tray-vertical-card' // observed class in provided HTML
    ].join(', ');
  }

  async function initHotstarRatings() {
    const debug = window.CONFIG?.DEBUG_MODE;
    try {
      await waitForRatingService();
      
      debug && console.log('Hotstar ratings extension initialized');
      
      const selectors = getHotstarSelectors();
      
      // Start observing for Hotstar content
      window.ratingDisplay.startObserving(selectors, extractHotstarTitle, document.body || document);
      
      // Re-process elements when URL changes (for SPA navigation)
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          setTimeout(() => {
            window.ratingDisplay.processElements(selectors, extractHotstarTitle);
          }, 2000); // Wait for content to load
        }
      }).observe(document, { subtree: true, childList: true });

    } catch (error) {
      console.error('Error initializing Hotstar ratings:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHotstarRatings);
  } else {
    initHotstarRatings();
  }

  // Also initialize after a short delay to catch dynamically loaded content
  setTimeout(initHotstarRatings, 3000);

  // Handle messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_RATINGS') {
      const selectors = getHotstarSelectors();
      window.ratingDisplay.clearProcessed();
      window.ratingDisplay.processElements(selectors, extractHotstarTitle);
      sendResponse({ success: true });
    }
    
    if (message.type === 'REFRESH_RATINGS') {
      const selectors = getHotstarSelectors();
      window.ratingDisplay.clearProcessed();
      window.ratingDisplay.processElements(selectors, extractHotstarTitle);
      sendResponse({ success: true });
    }
    
    if (message.type === 'CLEAR_CACHE') {
      if (window.ratingService) {
        window.ratingService.cache.clear();
      }
      sendResponse({ success: true });
    }
  });

})();
