# AgileWeb Chrome Extension - Installation Guide

## Quick Start

1. **Start the Web Dashboard**
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:3000`

2. **Load the Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension` folder from this repository
   - The extension icon should appear in your toolbar

3. **Configure Your First Profile**
   - Click the AgileWeb extension icon
   - Click "Open Dashboard"
   - Create a child profile with age group
   - Set it as the active profile
   - The extension will now filter content automatically

## Creating Extension Icons

The extension needs icon files. Create these in the `extension/icons/` folder:

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

You can use any image editor or online tool to create these icons. A simple shield icon works well for AgileWeb.

## Testing the Extension

1. Visit a known adult site (e.g., pornhub.com)
2. The site should be blocked immediately
3. Check the extension popup for status
4. View blocked attempts in the dashboard

## Troubleshooting

- **Extension not loading**: Make sure you selected the `extension` folder, not the root folder
- **Dashboard not connecting**: Ensure the Next.js app is running on `http://localhost:3000`
- **Settings not syncing**: Check Chrome sync is enabled in Chrome settings
- **Content not being blocked**: Verify a child profile is active in the dashboard

## Next Steps

- Configure custom controls for specific URLs or keywords
- Set up site policies for per-domain rules
- Review blocked attempts and audit logs
- Adjust age group settings as needed

