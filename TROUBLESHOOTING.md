# Troubleshooting Guide

## Extension Loading Issues

### "Service worker registration failed. Status code: 15"

This error typically occurs due to issues in the background script. Here's how to fix it:

**Solution 1: Check File Permissions**
```bash
# Make sure all files are readable
chmod -R 644 /path/to/extension/
chmod 755 /path/to/extension/
```

**Solution 2: Reload Extension**
1. Go to `chrome://extensions/`
2. Find your extension
3. Click the **reload** button (🔄)
4. Check for new errors

**Solution 3: Check Console**
1. Go to `chrome://extensions/`
2. Click **"Details"** on your extension
3. Click **"Inspect views service worker"**
4. Look for error messages in the console

### "Cannot read properties of undefined (reading 'create')"

This means the Chrome API isn't available. Common causes:

**Fix 1: Check Manifest Permissions**
Make sure `manifest.json` includes:
```json
{
  "permissions": [
    "storage",
    "activeTab",
    "contextMenus"
  ]
}
```

**Fix 2: Wait for API Availability**
The background script now includes proper error handling for this.

**Fix 3: Clear Extension Data**
1. Go to `chrome://extensions/`
2. Remove the extension completely
3. Restart Chrome
4. Reload the extension

## Content Script Issues

### "Ratings not appearing"

**Check API Key:**
1. Open extension popup
2. Verify API key is set
3. Or check `scripts/config.js` for hard-coded key

**Check Console Errors:**
1. Open Netflix/Hotstar
2. Press `F12` → Console
3. Look for extension-related errors

**Force Refresh:**
1. Right-click on page → "Toggle Ratings Display"
2. Or use extension popup → "Refresh Ratings"

### "Extension not working on specific sites"

**Check URL Patterns:**
Make sure you're on the correct domains:
- `netflix.com` (not `netflix.co.uk` or other variants)
- `hotstar.com` (availability varies by region)

**Check Content Script Loading:**
1. Open Developer Tools (`F12`)
2. Go to **Sources** tab
3. Look for extension scripts under **Content scripts**

## API Issues

### "Invalid API key" or "API requests failing"

**Get New API Key:**
1. Visit: https://www.omdbapi.com/apikey.aspx
2. Sign up for FREE account
3. Check email for API key
4. Update in extension settings

**Check API Key Format:**
- Should be 8 characters
- Letters and numbers only
- Example: `er7fab12`

**Test API Key:**
```bash
curl "https://www.omdbapi.com/?apikey=YOUR_KEY&t=inception"
```

### "Rate limit exceeded"

Free accounts get 1,000 requests per day.

**Solutions:**
- Wait 24 hours for reset
- Upgrade to paid plan
- Use extension sparingly

## Installation Steps (Recap)

1. **Download extension files**
2. **Configure API key** (see SETUP.md)
3. **Open Chrome** → `chrome://extensions/`
4. **Enable "Developer mode"**
5. **Click "Load unpacked"**
6. **Select extension folder**
7. **Check for errors**

## Debug Mode

Enable debug logging by editing `scripts/config.js`:
```javascript
const CONFIG = {
  DEBUG_MODE: true, // Set to true
  // ... other settings
};
```

This will show more detailed console messages.

## Common File Issues

### Missing Files
Make sure all these files exist:
```
├── manifest.json
├── scripts/
│   ├── config.js
│   ├── background.js
│   ├── rating-service.js
│   ├── rating-display.js
│   ├── netflix-content.js
│   └── hotstar-content.js
├── styles/
│   └── ratings.css
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### File Corruption
If files seem corrupted:
1. Re-download the extension
2. Check file sizes (should not be 0 bytes)
3. Verify file permissions

## Getting Help

If none of these solutions work:

1. **Check Chrome Version**
   - Minimum: Chrome 88+
   - Update if needed

2. **Try Incognito Mode**
   - Extensions must be enabled for incognito

3. **Disable Other Extensions**
   - Temporarily disable other extensions to check for conflicts

4. **Contact Support**
   - Create an issue with:
     - Chrome version
     - Extension version
     - Console error messages
     - Steps to reproduce

## Reset Extension

Complete reset procedure:
1. Remove extension from Chrome
2. Clear browser data (optional)
3. Restart Chrome
4. Re-install extension
5. Reconfigure settings

---

**Still having issues?** Check the main [README.md](README.md) for additional help.
