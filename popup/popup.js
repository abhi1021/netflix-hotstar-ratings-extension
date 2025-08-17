// Popup JavaScript for Netflix & Hotstar Ratings Extension

document.addEventListener('DOMContentLoaded', async () => {
  // DOM elements
  const enableExtension = document.getElementById('enableExtension');
  const apiKeyInput = document.getElementById('apiKey');
  const toggleApiKeyBtn = document.getElementById('toggleApiKey');
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  const apiStatus = document.getElementById('apiStatus');
  const currentSite = document.getElementById('currentSite');
  const refreshRatingsBtn = document.getElementById('refreshRatings');

  // Load current settings
  await loadSettings();
  await updateCurrentTab();

  // Event listeners
  enableExtension.addEventListener('change', handleExtensionToggle);
  toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  refreshRatingsBtn.addEventListener('click', refreshRatings);

  // Load settings from storage
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get(['extensionEnabled', 'omdbApiKey']);
      
      enableExtension.checked = settings.extensionEnabled !== false;
      
      if (settings.omdbApiKey) {
        apiKeyInput.value = settings.omdbApiKey;
        showStatus('API key loaded', 'success');
      } else {
        showStatus('Please enter your OMDb API key', 'error');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showStatus('Error loading settings', 'error');
    }
  }

  // Handle extension toggle
  async function handleExtensionToggle() {
    try {
      const enabled = enableExtension.checked;
      await chrome.storage.sync.set({ extensionEnabled: enabled });
      
      // Send message to content scripts
      const tabs = await chrome.tabs.query({
        url: ['https://*.netflix.com/*', 'https://*.hotstar.com/*']
      });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'EXTENSION_TOGGLED',
            enabled: enabled
          });
        } catch (error) {
          // Ignore errors for tabs without content script
        }
      }
      
      showStatus(enabled ? 'Extension enabled' : 'Extension disabled', 'success');
    } catch (error) {
      console.error('Error toggling extension:', error);
      showStatus('Error updating settings', 'error');
    }
  }

  // Toggle API key visibility
  function toggleApiKeyVisibility() {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    toggleApiKeyBtn.textContent = isPassword ? '🙈' : '👁️';
  }

  // Save API key
  async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    // Basic validation - OMDb keys are typically 8 characters
    if (apiKey.length < 8) {
      showStatus('API key seems too short', 'error');
      return;
    }

    try {
      // Test the API key
      showStatus('Testing API key...', '');
      
      const testUrl = `https://www.omdbapi.com/?apikey=${apiKey}&t=inception&plot=short`;
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (data.Response === 'True') {
        await chrome.storage.sync.set({ omdbApiKey: apiKey });
        showStatus('API key saved successfully!', 'success');
        
      } else if (data.Error && data.Error.includes('Invalid API key')) {
        showStatus('Invalid API key', 'error');
      } else {
        showStatus('API key test failed', 'error');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      showStatus('Error testing API key', 'error');
    }
  }


  // Refresh ratings on current tab
  async function refreshRatings() {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (isValidSite(activeTab.url)) {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'REFRESH_RATINGS'
        });
        showStatus('Refreshing ratings...', 'success');
      }
    } catch (error) {
      console.error('Error refreshing ratings:', error);
      showStatus('Error refreshing ratings', 'error');
    }
  }

  // Update current tab info
  async function updateCurrentTab() {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (activeTab.url.includes('netflix.com')) {
        currentSite.textContent = '📺 Netflix';
        refreshRatingsBtn.disabled = false;
      } else if (activeTab.url.includes('hotstar.com')) {
        currentSite.textContent = '⭐ Hotstar';
        refreshRatingsBtn.disabled = false;
      } else {
        currentSite.textContent = 'Not on Netflix or Hotstar';
        refreshRatingsBtn.disabled = true;
      }
    } catch (error) {
      console.error('Error updating current tab:', error);
    }
  }


  // Check if URL is a valid site
  function isValidSite(url) {
    return url && (url.includes('netflix.com') || url.includes('hotstar.com'));
  }

  // Show status message
  function showStatus(message, type) {
    apiStatus.textContent = message;
    apiStatus.className = `status-message ${type}`;
    
    if (type && message) {
      setTimeout(() => {
        apiStatus.textContent = '';
        apiStatus.className = 'status-message';
      }, 3000);
    }
  }

  // Handle link clicks
  document.getElementById('aboutLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/yourusername/netflix-hotstar-ratings#readme'
    });
  });

  document.getElementById('supportLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: 'https://github.com/yourusername/netflix-hotstar-ratings/issues'
    });
  });

  // Listen for tab changes
  chrome.tabs.onActivated.addListener(updateCurrentTab);
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      updateCurrentTab();
    }
  });
});
