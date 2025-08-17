# Setup Instructions

## Quick Setup with API Key

### Method 1: Edit Config File (Recommended)

1. **Open the config file**: `scripts/config.js`
2. **Replace the API key**:
   ```javascript
   const CONFIG = {
     OMDB_API_KEY: 'YOUR_ACTUAL_API_KEY_HERE', // Replace this
     // ... other settings
   };
   ```
3. **Save the file**
4. **Load the extension** in Chrome

### Method 2: Direct Code Edit

1. **Open**: `scripts/rating-service.js`
2. **Find line 4** and replace:
   ```javascript
   this.defaultApiKey = 'YOUR_ACTUAL_API_KEY_HERE';
   ```
3. **Save and reload** the extension

### Method 3: Use Extension Popup (Original Method)

1. **Load the extension** without editing code
2. **Click the extension icon** in Chrome toolbar
3. **Enter your API key** in the popup
4. **Click "Save API Key"**

## Getting Your OMDb API Key

1. **Visit**: https://www.omdbapi.com/apikey.aspx
2. **Choose "FREE!"** plan (1,000 requests/day)
3. **Fill out the form**:
   - First Name, Last Name, Email
   - Account Type: FREE
   - Use: Non-commercial
4. **Check your email** for the API key
5. **Copy the key** (usually 8 characters like: `a1b2c3d4`)

## Verification

After setting up your API key:

1. **Visit Netflix or Hotstar**
2. **Look for rating badges** on movie tiles
3. **Check browser console** for any errors:
   - Press `F12` → Console tab
   - Look for extension messages

## Example API Keys

**Valid key format**: `` (8 characters, letters and numbers)

**Invalid formats**:
- Too short: `abc123`
- Too long: `abc123def456789`
- Wrong characters: `abc-123-def`

## Troubleshooting

### No ratings appear:
- ✅ Check API key is correct
- ✅ Verify you're on Netflix/Hotstar
- ✅ Check console for errors
- ✅ Try refreshing the page

### "Invalid API key" errors:
- ✅ Double-check the key from your email
- ✅ Make sure no extra spaces
- ✅ Verify account is activated

### Extension not loading:
- ✅ Check all files are present
- ✅ Enable Developer mode in Chrome
- ✅ Try "Load unpacked" again

## Security Note

- ✅ **API keys are stored locally** in your browser
- ✅ **Never share your API key** publicly
- ✅ **Free tier** has daily limits (1,000 requests)
- ✅ **Keys can be regenerated** if compromised
