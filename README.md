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
