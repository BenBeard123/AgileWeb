/**
 * V2: Self-harm and suicide discussion detection
 * Distinguishes between help-seeking and encouragement
 */

export interface SelfHarmAnalysis {
  detected: boolean;
  type: 'help-seeking' | 'encouragement' | 'instruction' | 'discussion' | null;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Detects self-harm and suicide-related content
 */
export function detectSelfHarm(
  text: string,
  metadata?: { title?: string; description?: string }
): SelfHarmAnalysis {
  if (!text || typeof text !== 'string') text = '';

  const fullText = (
    text + ' ' +
    (metadata?.title || '') + ' ' +
    (metadata?.description || '')
  ).toLowerCase();

  // Help-seeking indicators
  const helpSeekingTerms = [
    'suicide prevention',
    'crisis hotline',
    'get help',
    'reach out',
    'mental health',
    'therapy',
    'counseling',
    'support',
    'suicide prevention',
    '988', // US suicide hotline
    'lifeline',
    'helpline',
  ];

  // Encouragement indicators (dangerous)
  const encouragementTerms = [
    'kill yourself',
    'end it all',
    'just do it',
    'no one cares',
    'you should die',
    'better off dead',
    'worthless',
    'no one would miss',
  ];

  // Instruction indicators (very dangerous)
  const instructionTerms = [
    'how to',
    'method',
    'way to',
    'best way',
    'easiest way',
    'painless',
    'quick',
  ];

  // Discussion indicators (neutral)
  const discussionTerms = [
    'discussion',
    'talk about',
    'conversation',
    'awareness',
    'understanding',
  ];

  // General self-harm terms
  const selfHarmTerms = [
    'suicide',
    'self harm',
    'self-harm',
    'cutting',
    'hurting myself',
    'end my life',
    'take my life',
  ];

  // Check for presence of self-harm terms
  const hasSelfHarmTerms = selfHarmTerms.some(term => fullText.includes(term));
  if (!hasSelfHarmTerms) {
    return {
      detected: false,
      type: null,
      confidence: 0,
      severity: 'low',
    };
  }

  // Count matches
  const helpSeekingCount = helpSeekingTerms.filter(term => fullText.includes(term)).length;
  const encouragementCount = encouragementTerms.filter(term => fullText.includes(term)).length;
  const instructionCount = instructionTerms.filter(term => fullText.includes(term)).length;
  const discussionCount = discussionTerms.filter(term => fullText.includes(term)).length;

  // Determine type and severity
  if (instructionCount > 0 && hasSelfHarmTerms) {
    return {
      detected: true,
      type: 'instruction',
      confidence: Math.min(0.95, 0.7 + instructionCount * 0.1),
      severity: 'high',
    };
  }

  if (encouragementCount > 0) {
    return {
      detected: true,
      type: 'encouragement',
      confidence: Math.min(0.9, 0.6 + encouragementCount * 0.15),
      severity: 'high',
    };
  }

  if (helpSeekingCount > 0) {
    return {
      detected: true,
      type: 'help-seeking',
      confidence: Math.min(0.85, 0.7 + helpSeekingCount * 0.05),
      severity: 'medium',
    };
  }

  if (discussionCount > 0) {
    return {
      detected: true,
      type: 'discussion',
      confidence: 0.6,
      severity: 'low',
    };
  }

  // Default: detected but unclear intent
  return {
    detected: true,
    type: 'discussion',
    confidence: 0.5,
    severity: 'medium',
  };
}

