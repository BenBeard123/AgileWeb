# AgileWeb Chrome Extension

This is the Chrome extension version of AgileWeb, which provides age-appropriate content filtering for child safety.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this repository
5. The extension should now be installed and active

## Usage

### Setting Up Profiles

1. Click the AgileWeb extension icon in your Chrome toolbar
2. Click "Open Dashboard" to configure child profiles
3. The dashboard will open at `http://localhost:3000` (make sure the Next.js app is running)
4. Create child profiles, set age groups, and configure custom controls

### How It Works

- **Content Filtering**: The extension automatically checks all web pages you visit
- **Adult Site Blocking**: Known adult sites are automatically blocked
- **Custom Controls**: Block specific URLs, keywords, or interests
- **Site Policies**: Set per-site or per-domain policies
- **Gate Modes**: Configure warnings, delays, or parent approval requirements

### Extension Components

- **Popup**: Quick status view and dashboard access
- **Content Script**: Analyzes page content in real-time
- **Background Service Worker**: Handles filtering logic and storage
- **Blocked Page**: Shows when content is blocked

## Development

### Prerequisites

- Node.js and npm installed
- Chrome browser
- Next.js app running on `http://localhost:3000`

### Building

The extension uses the shared utilities from the main project:
- `data/adultSiteBlocklist.ts` - Adult site blocklist
- `utils/enhancedContentFilter.ts` - Content filtering logic
- `types/index.ts` - TypeScript type definitions

### Testing

1. Load the extension in Chrome (Developer mode)
2. Visit various websites to test filtering
3. Check the extension popup for status
4. View blocked attempts in the dashboard

## Configuration

All configuration is done through the web dashboard at `http://localhost:3000`. The extension syncs settings via Chrome storage.

## Permissions

The extension requires the following permissions:
- `storage` - To save settings and sync across devices
- `tabs` - To check and manage browser tabs
- `webRequest` - To intercept and filter web requests
- `webNavigation` - To block navigation to inappropriate sites
- `activeTab` - To analyze current page content
- `scripting` - To inject content scripts

## Notes

- The extension works best when the Next.js dashboard is running
- Settings are synced via Chrome sync (if enabled)
- Blocked attempts are logged and viewable in the dashboard
- The extension respects all configured age groups and custom controls

