# V2 Features Implementation

This document outlines the V2 features that have been implemented in AgileWeb.

## ✅ Implemented Features

### 1. Context-Aware Classification
- **Location**: `utils/contextAnalyzer.ts`
- **Features**:
  - Distinguishes between educational, promotional, glorification, discussion, instruction, news, historical, recruitment, propaganda, and help-seeking content
  - Adjusts access actions based on context (e.g., educational content is gated instead of blocked)
  - Confidence scoring for context detection

### 2. Slang & Coded Language Detection
- **Location**: `utils/slangDetection.ts`
- **Features**:
  - Detects common slang terms for drugs, violence, sexual content, and gambling
  - Identifies coded language patterns (number substitutions, leet speak, intentional misspellings)
  - Category-specific slang dictionaries

### 3. Self-Harm & Suicide Detection
- **Location**: `utils/selfHarmDetection.ts`
- **Features**:
  - Distinguishes between help-seeking, encouragement, instruction, and discussion
  - Severity classification (low, medium, high)
  - Confidence scoring
  - Different actions based on content type (help-seeking is allowed/gated, encouragement is blocked)

### 4. Cyberbullying Detection
- **Location**: `utils/cyberbullyingDetection.ts`
- **Features**:
  - Detects hate speech patterns
  - Identifies harassment patterns
  - Detects exclusion and body shaming
  - Severity classification with confidence scores

### 5. AI-Generated Content Detection
- **Location**: `utils/aiContentDetection.ts`
- **Features**:
  - Detects AI generation markers
  - Identifies suspiciously uniform content structure
  - Recognizes common AI phrases
  - Metadata-based detection

### 6. Per-App/Per-Site Policies
- **Location**: `utils/sitePolicyManager.ts`, `components/SitePolicyManager.tsx`
- **Features**:
  - Set policies for specific domains, URLs, or apps
  - Per-child or global policies
  - Age-group specific policies
  - Policy validation and matching

### 7. Enhanced Content Filtering
- **Location**: `utils/enhancedContentFilter.ts`
- **Features**:
  - Integrates all V2 detection systems
  - Confidence-based action adjustment
  - Conservative behavior (low confidence defaults to GATE instead of BLOCK)
  - Context-aware action recommendations
  - Comprehensive reasoning for decisions

### 8. Enhanced API Support
- **Location**: `app/api/filter/route.ts`
- **Features**:
  - Optional V2 enhanced filtering via `useV2` parameter
  - Site policy support
  - Returns context labels and confidence scores
  - Backward compatible with V1

## 🎯 Usage

### Using V2 Enhanced Filtering

```typescript
import { shouldBlockContentEnhanced } from '@/utils/enhancedContentFilter';

const result = shouldBlockContentEnhanced(
  url,
  content,
  ageGroup,
  customControls,
  sitePolicies, // Optional
  metadata // Optional
);

// Result includes:
// - blocked: boolean
// - action: AccessAction
// - categoryId, contentTypeId
// - contextLabel: ContextLabel
// - confidence: number
// - reason: string
// - enhancedAnalysis: EnhancedContentAnalysis
```

### API Usage

```bash
POST /api/filter
{
  "url": "https://example.com",
  "content": "Content text...",
  "ageGroup": "AGE_10_13",
  "customControls": [],
  "sitePolicies": [], // V2
  "useV2": true, // Enable V2 features
  "metadata": {
    "title": "Page title",
    "description": "Page description"
  }
}
```

## 📊 Detection Capabilities

### Slang Terms Detected
- Drugs: "Z", "W", "smoke up", "420", "blaze", "green", etc.
- Violence: "cap", "smoke", "clap", "pop", "drop"
- Sexual: "thirst trap", "onlyfans", "nsfw", "lewds"
- Gambling: "degen", "yolo", "all in", "bet"

### Context Labels
- `educational`: Educational/medical content
- `promotional`: Marketing/advertising content
- `glorification`: Content that glorifies harmful behavior
- `discussion`: Neutral discussion
- `instruction`: Instructional content
- `news`: News reporting
- `historical`: Historical content
- `recruitment`: Recruitment/propaganda
- `propaganda`: Propaganda content
- `help-seeking`: Content seeking help

### Self-Harm Types
- `help-seeking`: Content seeking help (allowed/gated)
- `encouragement`: Encouraging self-harm (blocked)
- `instruction`: Instructions for self-harm (blocked)
- `discussion`: Neutral discussion (gated)

## 🔮 Future Enhancements

### Not Yet Implemented (Ready for Integration)
1. **Vision/Image Classification**: Tattoos, piercings, weapons, beauty filters
2. **ML Model Integration**: Replace rule-based detection with trained models
3. **Short-Video Unplayable Mode**: Player-level blocking for short videos
4. **Real-time Browser Extension**: Live content filtering
5. **Advanced NLP**: More sophisticated text analysis

## 📝 Notes

- All V2 features are backward compatible
- V1 filtering remains the default
- V2 features can be enabled per-request via API
- Site policies take highest priority in filtering decisions
- Conservative behavior: low confidence defaults to GATE, not BLOCK

