// Background service worker for Netflix & Hotstar Ratings extension

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Netflix & Hotstar Ratings extension installed/updated');
  
  // Set default settings
  chrome.storage.sync.set({
    extensionEnabled: true,
    omdbApiKey: '' // User needs to set this
  });
  
  // Create context menu items
  try {
    chrome.contextMenus.create({
      id: 'toggle-ratings',
      title: 'Toggle Ratings Display',
      contexts: ['page'],
      documentUrlPatterns: ['https://*.netflix.com/*', 'https://*.hotstar.com/*']
    });
  } catch (error) {
    console.warn('Context menu creation failed:', error);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_RATINGS') {
    // This could be used for more complex API requests if needed
    // For now, content scripts handle their own API requests
    sendResponse({ success: true });
  }
  
  if (message.type === 'LOG_ERROR') {
    console.error('Extension error:', message.error, 'from tab:', sender.tab?.id);
  }
  
  return true; // Keep message channel open for async responses
});

// Handle extension icon click (optional since we have popup)
chrome.action.onClicked.addListener(async (tab) => {
  // The popup will handle this, but we can add logic here if needed
  console.log('Extension icon clicked on tab:', tab.id);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'toggle-ratings') {
    // Send message to content script to toggle ratings
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_RATINGS' });
    } catch (error) {
      console.error('Error toggling ratings:', error);
    }
  }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    console.log('Storage changed:', changes);
    
    // Notify all Netflix and Hotstar tabs about settings changes
    chrome.tabs.query({
      url: ['https://*.netflix.com/*', 'https://*.hotstar.com/*']
    }).then(tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          type: 'SETTINGS_CHANGED', 
          changes: changes 
        }).catch(() => {
          // Ignore errors for tabs that don't have content script loaded
        });
      });
    });
  }
});

console.log('Netflix & Hotstar Ratings background script loaded');
