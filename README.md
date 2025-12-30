# AgileWeb

**Age-Appropriate Content Filtering for Child Safety**

AgileWeb is a comprehensive content filtering system that helps parents manage age-appropriate access to websites and content. It includes both a web dashboard for configuration and a Chrome extension for real-time content filtering.

## Features

- 🛡️ **Chrome Extension**: Real-time content filtering as you browse
- 🌐 **Web Dashboard**: Comprehensive configuration interface
- 👶 **Age-Based Filtering**: 5 age groups with tailored rules
- 🎯 **Custom Controls**: Block specific URLs, keywords, or interests
- 📊 **Site Policies**: Per-site or per-domain policies
- 📝 **Audit Logging**: Track all blocked attempts and rule changes
- 🔔 **Parent Notifications**: Get notified when content is blocked
- 🚫 **Adult Site Blocklist**: Automatic blocking of known adult sites

## Quick Start

### 1. Install the Chrome Extension

1. Start the web dashboard:
   ```bash
   npm install
   npm run dev
   ```

2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

3. Open the dashboard at `http://localhost:3000`

4. Create a child profile and set it as active

### 2. Configure Settings

Use the web dashboard to:
- Create child profiles with age groups
- Set custom controls (URLs, keywords, interests)
- Configure site policies
- Review blocked attempts and audit logs

### 3. Start Filtering

The extension automatically:
- Blocks adult sites
- Filters content based on age group
- Applies custom controls
- Enforces site policies
- Logs all blocked attempts

## Project Structure

```
AgileWeb/
├── app/                    # Next.js app (web dashboard)
├── components/             # React components
├── extension/             # Chrome extension files
│   ├── manifest.json      # Extension manifest
│   ├── background.js     # Service worker
│   ├── content.js         # Content script
│   ├── popup.html/js      # Extension popup
│   └── blocked.html       # Blocked page
├── store/                 # State management
│   ├── useStore.ts        # Web app store
│   ├── useChromeStore.ts  # Extension store
│   └── chromeStorageAdapter.ts
├── utils/                 # Filtering utilities
└── data/                  # Content categories & blocklists
```

## Extension vs Web App

- **Web Dashboard**: Full-featured configuration interface accessible at `http://localhost:3000`
- **Chrome Extension**: Real-time content filtering that works as you browse
- **Storage Sync**: Settings sync between extension and dashboard via Chrome storage

## Documentation

- [Extension Installation Guide](./extension/INSTALL.md)
- [V2 Features](./V2_FEATURES.md)
- [Extension README](./extension/README.md)

# AgileWeb - Age-Appropriate Access for Your Growing Child

**One-line framing:** AgileWeb applies age-appropriate access controls across content categories, balancing protection, context, and parental choice.

AgileWeb is a content access filter (web + apps) that classifies what a child is trying to view and applies age-based rules.

## Features

### 🛡️ Content Categorization & Access Control

AgileWeb provides granular control over 8 major content categories:

1. **Violence & Disturbing Content** - Graphic/non-graphic violence, horror, crime footage
2. **Sexual & Body-Related Content** - Explicit content, sexual education, body modification
3. **Substances & Addictive Behavior** - Drugs, alcohol, gambling, loot boxes
4. **Financial & Commercial Content** - Crypto, get-rich-quick schemes, influencer advice
5. **Media & Platform-Native Risks** - Short-form videos, live streams, AI-generated content
6. **Social & Cultural Topics** - LGBTQ+, religion, immigration, political content
7. **Weapons & Extremism** - Guns, weapons, extremist organizations
8. **Custom Parent Controls** - Block specific interests, URLs, or keywords

### 👶 Age Groups

- **UNDER_10** - Maximum protection
- **AGE_10_13** - Increased access with gates
- **AGE_13_16** - More permissive with context
- **AGE_16_18** - Near-adult access
- **AGE_18_PLUS** - No restrictions by default

### 🚦 Access Actions (Not Binary)

- **BLOCK** - Content not accessible, parent notified
- **GATE** - Allowed only after friction:
  - Warning + continue
  - Delay (10-30 seconds) + continue
  - Parent approval required (push notification)
- **ALLOW** - Unrestricted access

### 🎛️ Custom Parent Controls (Must-Haves)

- Block specific interests (examples: Roblox, cars)
- Block specific URLs (manual allow/block list)
- Keyword-based filters (single-meaning terms only; avoid ambiguous words)
- Parent notifications on blocked attempts
- Adjustable rules per child (each child profile has its own policy + exceptions)
- Category overrides per child
- Default gate mode configuration (warning, delay, or parent approval)

### 📊 Audit Log

Complete history of:
- Blocked attempts
- Parent approvals (approve once, approve for 24h, always allow for this site)
- Category overrides
- Rule changes
- Custom control additions/removals

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive styling
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BenBeard123/AgileWeb.git
cd AgileWeb
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

AgileWeb is a web-based parental control dashboard that uses a multi-layered content filtering system to protect children online. Here's how it works:

### Architecture Overview

AgileWeb consists of three main components:

1. **Parent Dashboard (Web App)**: A Next.js web application where parents configure profiles, set rules, and monitor activity
2. **Content Filtering Engine**: A rule-based classification system that analyzes URLs and content
3. **API Layer**: RESTful endpoints that can be integrated with browser extensions or other applications

### Content Filtering Workflow

When a child attempts to access content, AgileWeb follows this decision tree (in priority order):

```
1. Adult Site Blocklist Check (Highest Priority)
   ↓ If blocked → BLOCK immediately
   ↓ If not blocked → Continue

2. Site/App Policy Check (V2)
   ↓ If policy exists → Apply policy action
   ↓ If no policy → Continue

3. Custom Parent Controls Check
   ↓ If custom control matches → Apply control action
   ↓ If no match → Continue

4. Content Analysis
   ↓ Analyze URL, text, and metadata
   ↓ Detect category (violence, sexual, substances, etc.)
   ↓ Determine content type (graphic violence, sexual education, etc.)
   ↓ Continue

5. V2 Enhanced Analysis (if enabled)
   ↓ Context analysis (educational vs promotional)
   ↓ Slang detection
   ↓ Self-harm detection
   ↓ Cyberbullying detection
   ↓ AI content detection
   ↓ Calculate confidence score
   ↓ Continue

6. Age-Based Rule Application
   ↓ Look up rule for: [Category] + [Content Type] + [Age Group]
   ↓ Get action: BLOCK, GATE, or ALLOW
   ↓ Adjust based on context (if V2 enabled)
   ↓ Apply conservative behavior (low confidence → GATE)

7. Final Decision
   ↓ Return action with reasoning
   ↓ Log attempt in audit log
   ↓ Send notification to parent (if enabled)
```

### Content Analysis Process

#### Step 1: URL and Metadata Extraction
- Extract the URL, page title, and description
- Identify domain and URL patterns
- Check against known site patterns (short-form videos, live streams, etc.)

#### Step 2: Text Analysis
- Analyze page content, title, and description
- Detect keywords related to restricted categories
- Identify slang terms and coded language (V2)
- Check for self-harm indicators (V2)
- Detect cyberbullying patterns (V2)
- Identify AI-generated content markers (V2)

#### Step 3: Category Classification
The system classifies content into one of 8 categories:
- **Violence & Disturbing Content**: Detects violence keywords, horror terms, crime references
- **Sexual & Body-Related Content**: Identifies explicit content, sexual education, body modification
- **Substances & Addictive Behavior**: Detects drug/alcohol references, gambling content
- **Financial & Commercial Content**: Identifies crypto, get-rich-quick schemes, influencer advice
- **Media & Platform-Native Risks**: Detects short-form videos, live streams, AI content
- **Social & Cultural Topics**: Identifies LGBTQ+, religious, political content
- **Weapons & Extremism**: Detects weapons references, extremist content
- **Unknown/Unclassified**: Content that doesn't match any category (defaults to ALLOW)

#### Step 4: Context Analysis (V2)
For each classified piece of content, the system determines context:
- **Educational**: Medical/educational content (e.g., sexual education)
- **Promotional**: Marketing/advertising content
- **Glorification**: Content that glorifies harmful behavior
- **Discussion**: Neutral discussion of topics
- **Instruction**: How-to or instructional content
- **News**: News reporting
- **Historical**: Historical content
- **Recruitment**: Recruitment/propaganda content
- **Help-seeking**: Content seeking help (e.g., suicide prevention)

#### Step 5: Confidence Scoring (V2)
The system calculates a confidence score (0-1) based on:
- Number of matching keywords
- Context indicators
- Slang detection matches
- Pattern recognition strength
- Metadata quality

#### Step 6: Rule Application
1. Look up the content category and type in the policy matrix
2. Find the rule for the child's age group
3. Get the default action (BLOCK, GATE, or ALLOW)
4. Adjust based on context:
   - Educational content: BLOCK → GATE
   - Help-seeking content: BLOCK → ALLOW (for older ages)
   - Low confidence: BLOCK → GATE (conservative behavior)
5. Apply any category overrides set by the parent
6. Return final action

### Data Flow

```
┌─────────────────┐
│  Parent Config  │
│  (Dashboard)    │
└────────┬────────┘
         │
         │ Creates/Updates
         ↓
┌─────────────────┐
│  Zustand Store  │
│  (State Mgmt)    │
└────────┬────────┘
         │
         │ Stores
         ↓
┌─────────────────┐
│  Child Profiles │
│  Custom Controls│
│  Site Policies  │
└────────┬────────┘
         │
         │ Used by
         ↓
┌─────────────────┐
│ Content Filter  │
│    Engine       │
└────────┬────────┘
         │
         │ Analyzes
         ↓
┌─────────────────┐
│  URL + Content  │
│   + Metadata    │
└────────┬────────┘
         │
         │ Returns
         ↓
┌─────────────────┐
│  Action Decision│
│  (BLOCK/GATE/   │
│   ALLOW)        │
└────────┬────────┘
         │
         │ Logs
         ↓
┌─────────────────┐
│  Audit Log      │
│  Blocked Attempts│
└─────────────────┘
```

### Integration Points

#### Browser Extension (Future)
A browser extension would:
1. Intercept navigation requests
2. Send URL + page content to `/api/filter`
3. Receive action decision
4. Block page, show gate screen, or allow access
5. Send notifications to parent dashboard

#### API Usage
```javascript
POST /api/filter
{
  "url": "https://example.com",
  "content": "Page content...",
  "ageGroup": "AGE_10_13",
  "customControls": [...],
  "sitePolicies": [...],  // V2
  "useV2": true,           // Enable V2 features
  "metadata": {
    "title": "Page Title",
    "description": "Page description"
  }
}

Response:
{
  "blocked": true,
  "action": "BLOCK",
  "categoryId": "sexual",
  "contentTypeId": "explicit-sexual",
  "contextLabel": "promotional",  // V2
  "confidence": 0.95,             // V2
  "reason": "Blocked adult site: pornhub.com"
}
```

### State Management

AgileWeb uses **Zustand** for state management, storing:
- **Children**: Array of child profiles with age groups and settings
- **Blocked Attempts**: History of blocked/gated content access
- **Audit Log**: Complete history of all actions and changes
- **Site Policies**: Per-site/app policies (V2)
- **Custom Controls**: Parent-defined URL/keyword/interest blocks

All state is stored in memory (localStorage persistence can be added for production).

### Safety Features

1. **Input Validation**: All user inputs are validated and sanitized
2. **Error Boundaries**: React error boundaries catch and handle errors gracefully
3. **Type Safety**: Full TypeScript coverage prevents runtime errors
4. **Conservative Defaults**: Low confidence defaults to GATE, not BLOCK
5. **Memory Limits**: Arrays are limited to prevent memory issues (1000 attempts, 100 controls)
6. **Unique IDs**: Timestamp + random string ensures unique identifiers

### Priority Order Summary

1. **Adult Site Blocklist** (Cannot be overridden)
2. **Site/App Policies** (V2, per-site rules)
3. **Custom Parent Controls** (URL/keyword/interest blocks)
4. **Content Category Rules** (Age-based matrix)
5. **Context Adjustments** (V2, educational → GATE)
6. **Conservative Behavior** (Low confidence → GATE)

## Project Structure

```
AgileWeb/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Dashboard.tsx     # Main dashboard view
│   ├── ChildProfileManager.tsx  # Manage child profiles
│   ├── ContentCategoryView.tsx  # View content categories
│   ├── CustomControlsPanel.tsx  # Custom controls UI
│   └── BlockedAttemptsView.tsx # View blocked attempts
├── data/                  # Static data
│   └── contentCategories.ts  # Content category definitions
├── store/                 # State management
│   └── useStore.ts       # Zustand store
├── types/                 # TypeScript types
│   └── index.ts         # Type definitions
└── utils/                 # Utility functions
    └── contentFilter.ts  # Content filtering logic
```

## Usage

### Adding a Child Profile

1. Navigate to the "Children" tab
2. Click "Add Child"
3. Enter the child's name and select their age group
4. Enable/disable notifications for blocked attempts
5. Click "Add Child"

### Configuring Content Categories

1. Navigate to the "Content Categories" tab
2. Expand any category to view content types
3. Rules are pre-configured based on age groups
4. Rules can be customized per child in future updates

### Setting Custom Controls

1. Navigate to the "Custom Controls" tab
2. Select a child profile
3. Choose control type (Interest, URL, or Keyword)
4. Enter the value to block/allow
5. Select the action (Block, Gate, or Allow)
6. Click "Add Control"

### Viewing Blocked Attempts

1. Navigate to the "Blocked Attempts" tab
2. View all blocked, gated, or flagged access attempts
3. Attempts are grouped by date
4. Clear all attempts if needed

## Context-Aware Classification

AgileWeb avoids over-blocking by using "topic + intent + context" instead of naive keyword blocking:

- **Sexual education**: Educational/medical differs from erotic/explicit
- **Violence**: News/historical reporting differs from glorification/calls to violence
- **Religion**: Educational differs from recruitment/harassment
- **Politics/ideology**: Discussion/education differs from recruitment/propaganda
- **Self-harm**: Discussion/help-seeking differs from encouragement/instruction

## Categorization Engine

### Signals

- **Text NLP classification**: Violence, drugs, explicit content, terrorism/extremism, abusive/hate slurs, self-harm encouragement
- **Slang detection**: Examples: "Z", "W", "smoke up"
- **Vision/image classification**: Weapons, gore, nudity, tattoos/piercings, gambling UIs, "beauty filter" indicators
- **Metadata**: Domain reputation, site category, page structure
- **Short-video heuristics**: Duration <10s, vertical player, reels endpoints
- **Livestream heuristics**: LIVE badges, chat overlays, livestream endpoints

### Classifier Output

- Category (one of the 8 categories)
- Confidence (0–1)
- Context label (educational vs promotional vs glorification vs discussion vs instruction)
- Recommended action per age bucket (from the matrix)

### Conservative Behavior

- If confidence is low: default to GATE (not BLOCK) unless extremist propaganda or explicit sexual content

## Future Enhancements

### V2 Features

- Context-aware classifier (topic + intent)
- Vision classification (tattoos/piercings/weapons/filters)
- Short-video "unplayable" mode at the player layer
- Slang/coded language detection
- Per-app/per-site policies
- Trained ML Models for violence, drugs, explicit content detection
- Cyberbullying detection
- AI-generated content identification
- Self-harm/suicide discussion detection

### Browser Extension

- Real-time content filtering
- Automatic blocking/gating based on rules
- Parent notification system
- Activity logging

### API Integration

- RESTful API for content analysis
- Webhook support for notifications
- Integration with parental control systems

### Advanced Features

- Contextual analysis (educational vs promotional content)
- Historical vs ideological content distinction
- Advocacy vs recruitment detection
- Multi-language support
- Regulatory compliance (COPPA, UK AADC, EU DSA)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**AgileWeb** - Protecting children online, one filter at a time. 🛡️
