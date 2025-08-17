class RatingService {
  constructor() {
    // OMDb API key from config
    this.defaultApiKey = window.CONFIG?.OMDB_API_KEY || '';
    this.apiKey = this.defaultApiKey; // Start with default key
    this.baseUrl = window.CONFIG?.API_BASE_URL || 'https://www.omdbapi.com/';
    this.cache = new Map();
    this.debugMode = window.CONFIG?.DEBUG_MODE || false;
    this.loadApiKey();
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.sync.get(['omdbApiKey']);
      // Use stored API key if available, otherwise fall back to default
      this.apiKey = result.omdbApiKey || this.defaultApiKey;
    } catch (error) {
      console.error('Error loading API key:', error);
      // Fallback to default API key on error
      this.apiKey = this.defaultApiKey;
    }
  }

  async saveApiKey(apiKey) {
    try {
      await chrome.storage.sync.set({ omdbApiKey: apiKey });
      this.apiKey = apiKey;
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  }

  cleanTitle(title) {
    // Remove year, episode info, and other metadata
    return title
      .replace(/\(\d{4}\)/g, '') // Remove year in parentheses
      .replace(/Season\s+\d+/gi, '') // Remove season info
      .replace(/Episode\s+\d+/gi, '') // Remove episode info
      .replace(/\s*:\s*.*$/, '') // Remove subtitle after colon
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  async getRatings(title) {
    if (!this.apiKey) {
      console.warn('OMDb API key not configured');
      return null;
    }

    const cleanedTitle = this.cleanTitle(title);
    
    // Check cache first
    if (this.cache.has(cleanedTitle)) {
      return this.cache.get(cleanedTitle);
    }

    try {
      const url = `${this.baseUrl}?apikey=${this.apiKey}&t=${encodeURIComponent(cleanedTitle)}&plot=short`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === 'True') {
        const ratings = {
          imdb: data.imdbRating !== 'N/A' ? data.imdbRating : null,
          rottenTomatoes: null,
          title: data.Title,
          year: data.Year,
          type: data.Type
        };

        // Extract Rotten Tomatoes rating
        if (data.Ratings && Array.isArray(data.Ratings)) {
          const rtRating = data.Ratings.find(rating => 
            rating.Source === 'Rotten Tomatoes'
          );
          if (rtRating) {
            ratings.rottenTomatoes = rtRating.Value;
          }
        }

        // Cache the result
        this.cache.set(cleanedTitle, ratings);
        return ratings;
      } else {
        console.log(`No ratings found for: ${cleanedTitle}`);
        this.cache.set(cleanedTitle, null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      return null;
    }
  }

  async isEnabled() {
    try {
      const result = await chrome.storage.sync.get(['extensionEnabled']);
      return result.extensionEnabled !== false; // Default to true
    } catch (error) {
      console.error('Error checking if extension is enabled:', error);
      return true;
    }
  }

  async setEnabled(enabled) {
    try {
      await chrome.storage.sync.set({ extensionEnabled: enabled });
    } catch (error) {
      console.error('Error setting extension enabled state:', error);
    }
  }
}

// Global instance
window.ratingService = new RatingService();
