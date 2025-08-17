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

  function extractNetflixTitle(element) {
    // Try different selectors for Netflix title extraction
    const titleSelectors = [
      '.titleCard--metadataWrapper .titleCard-title',
      '.title-card-metadata .video-title',
      '.fallback-text',
      '.video-artwork img[alt]',
      '.titleCard-title',
      '[data-uia="video-title"]',
      '.slider-item .video-title',
      'img[alt]:not([alt=""])'
    ];

    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement) {
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

    // Try aria-label as fallback
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }

    // Try title attribute as fallback
    const titleAttr = element.getAttribute('title');
    if (titleAttr && titleAttr.trim()) {
      return titleAttr.trim();
    }

    return null;
  }

  function getNetflixSelectors() {
    return [
      '.titleCard', // Main title cards
      '.slider-item', // Slider items
      '.title-card', // Alternative title cards
      '[data-uia="slider-item"]', // Data attribute selector
      '.video-artwork-container', // Video artwork containers
      '.titleCard-container' // Title card containers
    ].join(', ');
  }

  async function initNetflixRatings() {
    try {
      await waitForRatingService();
      
      console.log('Netflix ratings extension initialized');
      
      const selectors = getNetflixSelectors();
      
      // Start observing for Netflix content
      window.ratingDisplay.startObserving(selectors, extractNetflixTitle);
      
      // Re-process elements when URL changes (for SPA navigation)
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          setTimeout(() => {
            window.ratingDisplay.processElements(selectors, extractNetflixTitle);
          }, 2000); // Wait for content to load
        }
      }).observe(document, { subtree: true, childList: true });

    } catch (error) {
      console.error('Error initializing Netflix ratings:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetflixRatings);
  } else {
    initNetflixRatings();
  }

  // Also initialize after a short delay to catch dynamically loaded content
  setTimeout(initNetflixRatings, 3000);

  // Handle messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_RATINGS') {
      const selectors = getNetflixSelectors();
      window.ratingDisplay.clearProcessed();
      window.ratingDisplay.processElements(selectors, extractNetflixTitle);
      sendResponse({ success: true });
    }
    
    if (message.type === 'REFRESH_RATINGS') {
      const selectors = getNetflixSelectors();
      window.ratingDisplay.clearProcessed();
      window.ratingDisplay.processElements(selectors, extractNetflixTitle);
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
