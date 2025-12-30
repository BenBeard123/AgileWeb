/**
 * V2: Context-aware content analysis
 * Determines context labels (educational, promotional, glorification, etc.)
 */

import { ContextLabel } from '@/types';

export interface ContextAnalysis {
  contextLabel: ContextLabel;
  confidence: number;
  reasoning: string;
}

/**
 * Analyzes content to determine its context
 */
export function analyzeContext(
  text: string,
  url: string,
  categoryId: string,
  metadata?: { title?: string; description?: string }
): ContextAnalysis {
  if (!text || typeof text !== 'string') text = '';
  if (!url || typeof url !== 'string') url = '';

  const fullText = (
    text + ' ' +
    (metadata?.title || '') + ' ' +
    (metadata?.description || '')
  ).toLowerCase();

  const lowerUrl = url.toLowerCase();

  // Educational indicators
  const educationalIndicators = [
    'educational',
    'education',
    'learn',
    'teaching',
    'tutorial',
    'guide',
    'how to',
    'explained',
    'documentary',
    'history',
    'historical',
    'medical',
    'health',
    'science',
    'academic',
    'school',
    'university',
    'course',
    'lesson',
  ];

  // Promotional indicators
  const promotionalIndicators = [
    'buy now',
    'purchase',
    'subscribe',
    'sign up',
    'limited time',
    'deal',
    'discount',
    'sale',
    'promo',
    'advertisement',
    'ad',
    'sponsored',
    'affiliate',
  ];

  // Glorification indicators
  const glorificationIndicators = [
    'epic',
    'awesome',
    'cool',
    'badass',
    'legendary',
    'insane',
    'crazy',
    'extreme',
    'ultimate',
    'best ever',
    'amazing',
  ];

  // News indicators
  const newsIndicators = [
    'news',
    'breaking',
    'report',
    'reported',
    'journalist',
    'article',
    'coverage',
    'update',
    'latest',
    'headline',
  ];

  // Help-seeking indicators
  const helpSeekingIndicators = [
    'help',
    'support',
    'crisis',
    'hotline',
    'suicide prevention',
    'mental health',
    'therapy',
    'counseling',
    'resources',
    'get help',
    'reach out',
  ];

  // Recruitment/propaganda indicators
  const recruitmentIndicators = [
    'join us',
    'join our',
    'become a member',
    'sign up for',
    'recruit',
    'recruitment',
    'enlist',
    'propaganda',
    'indoctrination',
  ];

  // Count matches for each context type
  const educationalScore = educationalIndicators.filter(ind => 
    fullText.includes(ind) || lowerUrl.includes(ind)
  ).length;

  const promotionalScore = promotionalIndicators.filter(ind => 
    fullText.includes(ind) || lowerUrl.includes(ind)
  ).length;

  const glorificationScore = glorificationIndicators.filter(ind => 
    fullText.includes(ind)
  ).length;

  const newsScore = newsIndicators.filter(ind => 
    fullText.includes(ind) || lowerUrl.includes(ind)
  ).length;

  const helpSeekingScore = helpSeekingIndicators.filter(ind => 
    fullText.includes(ind)
  ).length;

  const recruitmentScore = recruitmentIndicators.filter(ind => 
    fullText.includes(ind) || lowerUrl.includes(ind)
  ).length;

  // Determine context based on scores
  if (categoryId === 'sexual' && educationalScore > 0) {
    return {
      contextLabel: 'educational',
      confidence: Math.min(0.9, 0.5 + educationalScore * 0.1),
      reasoning: 'Educational content detected based on keywords',
    };
  }

  if (categoryId === 'violence' && newsScore > 0) {
    return {
      contextLabel: 'news',
      confidence: Math.min(0.9, 0.6 + newsScore * 0.1),
      reasoning: 'News content detected',
    };
  }

  if (helpSeekingScore > 0) {
    return {
      contextLabel: 'help-seeking',
      confidence: Math.min(0.9, 0.7 + helpSeekingScore * 0.1),
      reasoning: 'Help-seeking content detected',
    };
  }

  if (recruitmentScore > 0) {
    return {
      contextLabel: 'recruitment',
      confidence: Math.min(0.9, 0.7 + recruitmentScore * 0.1),
      reasoning: 'Recruitment/propaganda content detected',
    };
  }

  if (promotionalScore > 0) {
    return {
      contextLabel: 'promotional',
      confidence: Math.min(0.9, 0.6 + promotionalScore * 0.1),
      reasoning: 'Promotional content detected',
    };
  }

  if (glorificationScore > 2) {
    return {
      contextLabel: 'glorification',
      confidence: Math.min(0.9, 0.6 + glorificationScore * 0.1),
      reasoning: 'Glorification content detected',
    };
  }

  if (educationalScore > 0) {
    return {
      contextLabel: 'educational',
      confidence: Math.min(0.8, 0.5 + educationalScore * 0.1),
      reasoning: 'Educational content detected',
    };
  }

  // Default to discussion
  return {
    contextLabel: 'discussion',
    confidence: 0.5,
    reasoning: 'No specific context indicators found, defaulting to discussion',
  };
}

