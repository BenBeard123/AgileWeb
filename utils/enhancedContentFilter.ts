/**
 * V2: Enhanced content filtering with context-aware classification
 * Integrates slang detection, self-harm detection, cyberbullying, AI detection, and context analysis
 */

import { AgeGroup, AccessAction, ContextLabel, ContentClassification } from '@/types';
import { analyzeContent } from './contentFilter';
import { detectSlang, detectCodedLanguage } from './slangDetection';
import { analyzeContext } from './contextAnalyzer';
import { detectSelfHarm } from './selfHarmDetection';
import { detectCyberbullying } from './cyberbullyingDetection';
import { detectAIContent } from './aiContentDetection';
import { getAccessAction } from './contentFilter';
import { findMatchingPolicies, SitePolicy } from './sitePolicyManager';

export interface EnhancedContentAnalysis {
  classification: ContentClassification;
  contextLabel: ContextLabel;
  confidence: number;
  slangDetected: boolean;
  selfHarmDetected: boolean;
  cyberbullyingDetected: boolean;
  aiContentDetected: boolean;
  reasoning: string[];
}

/**
 * Enhanced content analysis with V2 features
 */
export function analyzeContentEnhanced(
  url: string,
  text: string,
  ageGroup: AgeGroup,
  metadata?: { title?: string; description?: string }
): EnhancedContentAnalysis {
  const reasoning: string[] = [];

  // Basic content analysis
  const basicAnalysis = analyzeContent(url, text, metadata);
  
  if (!basicAnalysis) {
    // Check for AI content even if no category match
    const aiAnalysis = detectAIContent(text, metadata);
    if (aiAnalysis.detected) {
      return {
        classification: {
          categoryId: 'media',
          contentTypeId: 'ai-generated',
          confidence: aiAnalysis.confidence,
          contextLabel: 'promotional',
          recommendedAction: {
            UNDER_10: 'BLOCK',
            AGE_10_13: 'GATE',
            AGE_13_16: 'GATE',
            AGE_16_18: 'ALLOW',
            AGE_18_PLUS: 'ALLOW',
          },
        },
        contextLabel: 'promotional',
        confidence: aiAnalysis.confidence,
        slangDetected: false,
        selfHarmDetected: false,
        cyberbullyingDetected: false,
        aiContentDetected: true,
        reasoning: ['AI-generated content detected'],
      };
    }

    // Default: no category match
    return {
      classification: {
        categoryId: 'unknown',
        contentTypeId: 'unknown',
        confidence: 0.3,
        contextLabel: 'discussion',
        recommendedAction: {
          UNDER_10: 'ALLOW',
          AGE_10_13: 'ALLOW',
          AGE_13_16: 'ALLOW',
          AGE_16_18: 'ALLOW',
          AGE_18_PLUS: 'ALLOW',
        },
      },
      contextLabel: 'discussion',
      confidence: 0.3,
      slangDetected: false,
      selfHarmDetected: false,
      cyberbullyingDetected: false,
      aiContentDetected: false,
      reasoning: ['No restricted content detected'],
    };
  }

  // Context analysis
  const contextAnalysis = analyzeContext(text, url, basicAnalysis.categoryId, metadata);
  reasoning.push(`Context: ${contextAnalysis.contextLabel} (${(contextAnalysis.confidence * 100).toFixed(0)}% confidence)`);

  // Slang detection
  const slangMatches = detectSlang(text);
  const slangDetected = slangMatches.length > 0;
  if (slangDetected) {
    reasoning.push(`Slang detected: ${slangMatches.map(m => m.term).join(', ')}`);
  }

  // Coded language detection
  const codedLanguage = detectCodedLanguage(text);
  if (codedLanguage.detected) {
    reasoning.push(`Coded language detected: ${codedLanguage.patterns.join(', ')}`);
  }

  // Self-harm detection
  const selfHarmAnalysis = detectSelfHarm(text, metadata);
  const selfHarmDetected = selfHarmAnalysis.detected;
  if (selfHarmDetected) {
    reasoning.push(`Self-harm content: ${selfHarmAnalysis.type} (${selfHarmAnalysis.severity} severity)`);
    
    // Override category if self-harm is detected with high confidence
    if (selfHarmAnalysis.confidence > 0.7 && selfHarmAnalysis.type !== 'help-seeking') {
      return {
        classification: {
          categoryId: 'social', // Could be a new category, but using social for now
          contentTypeId: 'self-harm',
          confidence: selfHarmAnalysis.confidence,
          contextLabel: selfHarmAnalysis.type === 'help-seeking' ? 'help-seeking' : 'encouragement',
          recommendedAction: {
            UNDER_10: 'BLOCK',
            AGE_10_13: selfHarmAnalysis.type === 'help-seeking' ? 'GATE' : 'BLOCK',
            AGE_13_16: selfHarmAnalysis.type === 'help-seeking' ? 'GATE' : 'BLOCK',
            AGE_16_18: selfHarmAnalysis.type === 'help-seeking' ? 'GATE' : 'BLOCK',
            AGE_18_PLUS: 'ALLOW',
          },
        },
        contextLabel: selfHarmAnalysis.type === 'help-seeking' ? 'help-seeking' : 'encouragement',
        confidence: selfHarmAnalysis.confidence,
        slangDetected,
        selfHarmDetected: true,
        cyberbullyingDetected: false,
        aiContentDetected: false,
        reasoning,
      };
    }
  }

  // Cyberbullying detection
  const cyberbullyingAnalysis = detectCyberbullying(text);
  const cyberbullyingDetected = cyberbullyingAnalysis.detected;
  if (cyberbullyingDetected) {
    reasoning.push(`Cyberbullying detected: ${cyberbullyingAnalysis.severity} severity`);
    
    // Override category if cyberbullying is detected
    if (cyberbullyingAnalysis.confidence > 0.6) {
      return {
        classification: {
          categoryId: 'social',
          contentTypeId: 'discrimination',
          confidence: cyberbullyingAnalysis.confidence,
          contextLabel: 'encouragement',
          recommendedAction: {
            UNDER_10: 'BLOCK',
            AGE_10_13: 'BLOCK',
            AGE_13_16: cyberbullyingAnalysis.severity === 'high' ? 'BLOCK' : 'GATE',
            AGE_16_18: cyberbullyingAnalysis.severity === 'high' ? 'GATE' : 'ALLOW',
            AGE_18_PLUS: 'ALLOW',
          },
        },
        contextLabel: 'encouragement',
        confidence: cyberbullyingAnalysis.confidence,
        slangDetected,
        selfHarmDetected,
        cyberbullyingDetected: true,
        aiContentDetected: false,
        reasoning,
      };
    }
  }

  // AI content detection
  const aiAnalysis = detectAIContent(text, metadata);
  const aiContentDetected = aiAnalysis.detected;
  if (aiContentDetected && basicAnalysis.categoryId === 'media') {
    reasoning.push(`AI-generated content detected`);
  }

  // Calculate overall confidence
  let confidence = contextAnalysis.confidence;
  if (slangDetected) confidence = Math.min(0.95, confidence + 0.1);
  if (codedLanguage.detected) confidence = Math.min(0.95, confidence + 0.15);
  if (selfHarmDetected) confidence = Math.max(confidence, selfHarmAnalysis.confidence);
  if (cyberbullyingDetected) confidence = Math.max(confidence, cyberbullyingAnalysis.confidence);

  // Get recommended actions for all age groups
  const recommendedAction: Record<AgeGroup, AccessAction> = {
    UNDER_10: getAccessAction(basicAnalysis.categoryId, basicAnalysis.contentTypeId, 'UNDER_10') || 'ALLOW',
    AGE_10_13: getAccessAction(basicAnalysis.categoryId, basicAnalysis.contentTypeId, 'AGE_10_13') || 'ALLOW',
    AGE_13_16: getAccessAction(basicAnalysis.categoryId, basicAnalysis.contentTypeId, 'AGE_13_16') || 'ALLOW',
    AGE_16_18: getAccessAction(basicAnalysis.categoryId, basicAnalysis.contentTypeId, 'AGE_16_18') || 'ALLOW',
    AGE_18_PLUS: 'ALLOW',
  };

  // Adjust actions based on context
  if (contextAnalysis.contextLabel === 'educational' && recommendedAction[ageGroup] === 'BLOCK') {
    // Educational content should be gated, not blocked
    recommendedAction[ageGroup] = 'GATE';
    reasoning.push('Educational context detected, adjusting action to GATE');
  }

  if (contextAnalysis.contextLabel === 'help-seeking' && recommendedAction[ageGroup] === 'BLOCK') {
    // Help-seeking content should be allowed or gated
    recommendedAction[ageGroup] = ageGroup === 'UNDER_10' ? 'GATE' : 'ALLOW';
    reasoning.push('Help-seeking context detected, adjusting action');
  }

  // Conservative behavior: if confidence is low, default to GATE instead of BLOCK
  if (confidence < 0.6 && recommendedAction[ageGroup] === 'BLOCK' && basicAnalysis.categoryId !== 'weapons') {
    recommendedAction[ageGroup] = 'GATE';
    reasoning.push('Low confidence, defaulting to GATE instead of BLOCK');
  }

  return {
    classification: {
      categoryId: basicAnalysis.categoryId,
      contentTypeId: basicAnalysis.contentTypeId,
      confidence,
      contextLabel: contextAnalysis.contextLabel,
      recommendedAction,
    },
    contextLabel: contextAnalysis.contextLabel,
    confidence,
    slangDetected,
    selfHarmDetected,
    cyberbullyingDetected,
    aiContentDetected,
    reasoning,
  };
}

/**
 * Enhanced shouldBlockContent with V2 features
 */
export function shouldBlockContentEnhanced(
  url: string,
  content: string,
  ageGroup: AgeGroup,
  customControls: any[],
  sitePolicies?: SitePolicy[],
  metadata?: { title?: string; description?: string }
): {
  blocked: boolean;
  action: AccessAction;
  categoryId: string | null;
  contentTypeId: string | null;
  contextLabel?: ContextLabel;
  confidence?: number;
  reason: string;
  enhancedAnalysis?: EnhancedContentAnalysis;
} {
  // Check site policies first (highest priority)
  if (sitePolicies && sitePolicies.length > 0) {
    const matchingPolicies = findMatchingPolicies(url, sitePolicies);
    const relevantPolicy = matchingPolicies.find(p => p.ageGroup === ageGroup);
    
    if (relevantPolicy) {
      return {
        blocked: relevantPolicy.action === 'BLOCK',
        action: relevantPolicy.action,
        categoryId: null,
        contentTypeId: null,
        reason: `Site policy: ${relevantPolicy.sitePattern}`,
      };
    }
  }

  // Enhanced content analysis
  const enhancedAnalysis = analyzeContentEnhanced(url, content, ageGroup, metadata);
  const recommendedAction = enhancedAnalysis.classification.recommendedAction[ageGroup];

  return {
    blocked: recommendedAction === 'BLOCK',
    action: recommendedAction,
    categoryId: enhancedAnalysis.classification.categoryId,
    contentTypeId: enhancedAnalysis.classification.contentTypeId,
    contextLabel: enhancedAnalysis.contextLabel,
    confidence: enhancedAnalysis.confidence,
    reason: enhancedAnalysis.reasoning.join('; '),
    enhancedAnalysis,
  };
}

