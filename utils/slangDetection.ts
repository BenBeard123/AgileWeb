/**
 * V2: Slang and coded language detection
 * Detects common slang terms used to bypass filters
 */

export interface SlangMatch {
  term: string;
  category: string;
  confidence: number;
}

// Slang dictionaries organized by category
const DRUG_SLANG: Record<string, { category: string; confidence: number }> = {
  'z': { category: 'substances', confidence: 0.7 },
  'w': { category: 'substances', confidence: 0.7 },
  'smoke up': { category: 'substances', confidence: 0.8 },
  '420': { category: 'substances', confidence: 0.9 },
  'blaze': { category: 'substances', confidence: 0.7 },
  'green': { category: 'substances', confidence: 0.6 },
  'herb': { category: 'substances', confidence: 0.6 },
  'mary jane': { category: 'substances', confidence: 0.8 },
  'dank': { category: 'substances', confidence: 0.6 },
  'high': { category: 'substances', confidence: 0.5 },
  'stoned': { category: 'substances', confidence: 0.7 },
};

const VIOLENCE_SLANG: Record<string, { category: string; confidence: number }> = {
  'cap': { category: 'violence', confidence: 0.6 }, // "no cap" = no lie, but can mean shooting
  'smoke': { category: 'violence', confidence: 0.7 }, // "smoke someone" = kill
  'clap': { category: 'violence', confidence: 0.7 }, // "clap back" or shooting
  'pop': { category: 'violence', confidence: 0.6 }, // "pop off" = fight/shoot
  'drop': { category: 'violence', confidence: 0.5 }, // "drop someone" = kill
};

const SEXUAL_SLANG: Record<string, { category: string; confidence: number }> = {
  'thirst trap': { category: 'sexual', confidence: 0.8 },
  'onlyfans': { category: 'sexual', confidence: 0.9 },
  'nsfw': { category: 'sexual', confidence: 0.9 },
  'lewds': { category: 'sexual', confidence: 0.8 },
  'simp': { category: 'sexual', confidence: 0.5 },
};

const GAMBLING_SLANG: Record<string, { category: string; confidence: number }> = {
  'degen': { category: 'substances', confidence: 0.7 }, // degenerate gambler
  'yolo': { category: 'financial', confidence: 0.5 }, // often used in gambling context
  'all in': { category: 'substances', confidence: 0.6 },
  'bet': { category: 'substances', confidence: 0.5 },
};

// Combined slang dictionary
const SLANG_DICT: Record<string, { category: string; confidence: number }> = {
  ...DRUG_SLANG,
  ...VIOLENCE_SLANG,
  ...SEXUAL_SLANG,
  ...GAMBLING_SLANG,
};

/**
 * Detects slang terms in text
 */
export function detectSlang(text: string): SlangMatch[] {
  if (!text || typeof text !== 'string') return [];

  const lowerText = text.toLowerCase();
  const matches: SlangMatch[] = [];

  // Check for slang terms
  for (const [term, data] of Object.entries(SLANG_DICT)) {
    // Use word boundaries for better matching
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(lowerText)) {
      matches.push({
        term,
        category: data.category,
        confidence: data.confidence,
      });
    }
  }

  return matches;
}

/**
 * Checks if text contains coded language patterns
 */
export function detectCodedLanguage(text: string): { detected: boolean; patterns: string[] } {
  if (!text || typeof text !== 'string') return { detected: false, patterns: [] };

  const lowerText = text.toLowerCase();
  const patterns: string[] = [];

  // Number substitutions (e.g., "420", "69")
  if (/\b420\b/.test(lowerText)) patterns.push('number_substitution');
  if (/\b69\b/.test(lowerText)) patterns.push('number_substitution');

  // Leet speak patterns
  if (/[a-z]*[0-9@$!][a-z]*/i.test(text)) {
    // Check for common leet patterns
    if (/h[3@]ll[0o]/i.test(text) || /[fph][u@][ck]/i.test(text)) {
      patterns.push('leet_speak');
    }
  }

  // Intentional misspellings to bypass filters
  const misspellings = [
    /\bp[0o]rn\b/i,
    /\bdr[0o]gs\b/i,
    /\bv[i1]olence\b/i,
  ];
  misspellings.forEach((pattern, index) => {
    if (pattern.test(text)) {
      patterns.push('intentional_misspelling');
    }
  });

  return {
    detected: patterns.length > 0,
    patterns,
  };
}

