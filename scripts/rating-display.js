class RatingDisplay {
  constructor() {
    this.processedElements = new WeakSet();
    this.observer = null;
    this.debounceTimeout = null;
  }

  createRatingElement(ratings) {
    const container = document.createElement('div');
    container.className = 'ratings-overlay';
    
    if (ratings.imdb) {
      const imdbElement = document.createElement('div');
      imdbElement.className = 'rating-item imdb-rating';
      imdbElement.innerHTML = `
        <span class="rating-label">IMDb</span>
        <span class="rating-value">${ratings.imdb}</span>
      `;
      container.appendChild(imdbElement);
    }

    if (ratings.rottenTomatoes) {
      const rtElement = document.createElement('div');
      rtElement.className = 'rating-item rt-rating';
      // Convert percentage to just number for cleaner display
      const rtValue = ratings.rottenTomatoes.replace('%', '');
      rtElement.innerHTML = `
        <span class="rating-label">🍅</span>
        <span class="rating-value">${rtValue}%</span>
      `;
      container.appendChild(rtElement);
    }

    return container;
  }

  async addRatingToElement(element, titleExtractor) {
    if (this.processedElements.has(element)) {
      return;
    }

    const title = titleExtractor(element);
    if (!title) {
      return;
    }

    // Mark as processed immediately to prevent duplicate processing
    this.processedElements.add(element);

    try {
      const ratings = await window.ratingService.getRatings(title);
      
      if (ratings && (ratings.imdb || ratings.rottenTomatoes)) {
        const ratingElement = this.createRatingElement(ratings);
        
        // Remove any existing rating overlays
        const existingOverlay = element.querySelector('.ratings-overlay');
        if (existingOverlay) {
          existingOverlay.remove();
        }

        // Add the new rating overlay
        element.style.position = 'relative';
        element.appendChild(ratingElement);
      }
    } catch (error) {
      console.error('Error adding rating to element:', error);
    }
  }

  debounce(func, wait) {
    return (...args) => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  startObserving(selector, titleExtractor, rootElement = document) {
    // Initial processing of existing elements
    this.processElements(selector, titleExtractor, rootElement);

    // Set up mutation observer for dynamically added content
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(
      this.debounce((mutations) => {
        let shouldProcess = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldProcess = true;
          }
        });

        if (shouldProcess) {
          this.processElements(selector, titleExtractor, rootElement);
        }
      }, 500)
    );

    this.observer.observe(rootElement, {
      childList: true,
      subtree: true
    });
  }

  async processElements(selector, titleExtractor, rootElement = document) {
    const enabled = await window.ratingService.isEnabled();
    if (!enabled) {
      return;
    }

    const elements = rootElement.querySelectorAll(selector);
    const processingPromises = [];

    elements.forEach((element) => {
      if (!this.processedElements.has(element)) {
        processingPromises.push(
          this.addRatingToElement(element, titleExtractor)
        );
      }
    });

    // Process elements in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < processingPromises.length; i += batchSize) {
      const batch = processingPromises.slice(i, i + batchSize);
      await Promise.allSettled(batch);
      
      // Small delay between batches to be respectful to the API
      if (i + batchSize < processingPromises.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  clearProcessed() {
    this.processedElements = new WeakSet();
    // Remove all existing rating overlays
    document.querySelectorAll('.ratings-overlay').forEach(overlay => {
      overlay.remove();
    });
  }
}

// Global instance
window.ratingDisplay = new RatingDisplay();
