/**
 * V2: Cyberbullying detection
 * Detects patterns of harassment, hate speech, and bullying
 */

export interface CyberbullyingAnalysis {
  detected: boolean;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  patterns: string[];
}

/**
 * Detects cyberbullying patterns
 */
export function detectCyberbullying(text: string): CyberbullyingAnalysis {
  if (!text || typeof text !== 'string') {
    return {
      detected: false,
      severity: 'low',
      confidence: 0,
      patterns: [],
    };
  }

  const lowerText = text.toLowerCase();
  const patterns: string[] = [];

  // Hate speech patterns
  const hateSpeechTerms = [
    'hate',
    'disgusting',
    'gross',
    'ugly',
    'fat',
    'stupid',
    'idiot',
    'moron',
    'loser',
    'pathetic',
    'worthless',
  ];

  // Harassment patterns
  const harassmentPatterns = [
    /\bkill\s+yourself\b/i,
    /\bgo\s+die\b/i,
    /\byou\s+should\s+die\b/i,
    /\bno\s+one\s+cares\b/i,
    /\byou're\s+worthless\b/i,
    /\bunfollow\s+me\b/i, // Often used in harassment campaigns
  ];

  // Exclusion patterns
  const exclusionPatterns = [
    /\bno\s+one\s+likes\s+you\b/i,
    /\beveryone\s+hates\s+you\b/i,
    /\byou're\s+not\s+welcome\b/i,
    /\bstay\s+away\b/i,
  ];

  // Body shaming
  const bodyShamingTerms = [
    'fat',
    'ugly',
    'disgusting',
    'gross',
    'hideous',
    'repulsive',
  ];

  // Count matches
  let hateSpeechCount = 0;
  hateSpeechTerms.forEach(term => {
    if (term && lowerText.includes(term)) {
      hateSpeechCount++;
      if (!patterns.includes('hate_speech')) {
        patterns.push('hate_speech');
      }
    }
  });

  let harassmentCount = 0;
  harassmentPatterns.forEach(pattern => {
    try {
      if (pattern.test(text)) {
        harassmentCount++;
        if (!patterns.includes('harassment')) {
          patterns.push('harassment');
        }
      }
    } catch (error) {
      console.warn('Error testing harassment pattern:', error);
    }
  });

  let exclusionCount = 0;
  exclusionPatterns.forEach(pattern => {
    try {
      if (pattern.test(text)) {
        exclusionCount++;
        if (!patterns.includes('exclusion')) {
          patterns.push('exclusion');
        }
      }
    } catch (error) {
      console.warn('Error testing exclusion pattern:', error);
    }
  });

  let bodyShamingCount = 0;
  bodyShamingTerms.forEach(term => {
    if (term && lowerText.includes(term)) {
      bodyShamingCount++;
      if (!patterns.includes('body_shaming')) {
        patterns.push('body_shaming');
      }
    }
  });

  const totalScore = hateSpeechCount + harassmentCount * 2 + exclusionCount + bodyShamingCount;

  if (totalScore === 0) {
    return {
      detected: false,
      severity: 'low',
      confidence: 0,
      patterns: [],
    };
  }

  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (harassmentCount > 0 || totalScore >= 5) {
    severity = 'high';
  } else if (totalScore >= 3) {
    severity = 'medium';
  }

  const confidence = Math.min(0.95, 0.5 + (totalScore * 0.1));

  return {
    detected: true,
    severity,
    confidence,
    patterns: [...new Set(patterns)], // Remove duplicates
  };
}

