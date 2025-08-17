// Configuration file for Netflix & Hotstar Ratings Extension
// Replace the values below with your actual API keys

const CONFIG = {
  // OMDb API Configuration
  OMDB_API_KEY: '', // Get free key from https://www.omdbapi.com/apikey.aspx
  
  // Extension Settings
  DEFAULT_ENABLED: true,
  
  // API Settings
  API_BASE_URL: 'https://www.omdbapi.com/',
  
  // Rate Limiting
  MAX_CONCURRENT_REQUESTS: 5,
  REQUEST_DELAY_MS: 100,
  
  // Cache Settings
  CACHE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CACHE_SIZE: 1000,
  
  // UI Settings
  RATING_POSITION: 'top-left', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  SHOW_IMDB: true,
  SHOW_ROTTEN_TOMATOES: true,
  
  // Debug Settings
  DEBUG_MODE: false
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
