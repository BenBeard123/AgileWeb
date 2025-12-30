import { AgeGroup, AccessAction, ContentCategory, CustomParentControl } from '@/types';
import { contentCategories } from '@/data/contentCategories';

/**
 * Determines the access action for a given content type and age group
 */
export function getAccessAction(
  categoryId: string,
  contentTypeId: string,
  ageGroup: AgeGroup
): AccessAction | null {
  const category = contentCategories.find((c) => c.id === categoryId);
  if (!category) return null;

  const contentType = category.contentTypes.find((ct) => ct.id === contentTypeId);
  if (!contentType) return null;

  // For 18+, everything is allowed
  if (ageGroup === 'AGE_18_PLUS') return 'ALLOW';

  return contentType.rules[ageGroup] || null;
}

/**
 * Checks if a URL should be blocked based on custom controls
 */
export function checkCustomControls(
  url: string,
  content: string,
  customControls: CustomParentControl[]
): { blocked: boolean; action: AccessAction | null; control: CustomParentControl | null } {
  const lowerUrl = url.toLowerCase();
  const lowerContent = content.toLowerCase();

  for (const control of customControls) {
    const lowerValue = control.value.toLowerCase();

    switch (control.type) {
      case 'url':
        if (lowerUrl.includes(lowerValue)) {
          return {
            blocked: control.action === 'BLOCK',
            action: control.action,
            control,
          };
        }
        break;

      case 'keyword':
        if (lowerContent.includes(lowerValue) || lowerUrl.includes(lowerValue)) {
          return {
            blocked: control.action === 'BLOCK',
            action: control.action,
            control,
          };
        }
        break;

      case 'interest':
        if (lowerContent.includes(lowerValue) || lowerUrl.includes(lowerValue)) {
          return {
            blocked: control.action === 'BLOCK',
            action: control.action,
            control,
          };
        }
        break;
    }
  }

  return { blocked: false, action: null, control: null };
}

/**
 * Analyzes content to determine category and content type
 * This would be replaced with actual NLP/ML models in production
 */
export function analyzeContent(
  url: string,
  text: string,
  metadata?: { title?: string; description?: string }
): { categoryId: string; contentTypeId: string } | null {
  const lowerText = (text + ' ' + (metadata?.title || '') + ' ' + (metadata?.description || '')).toLowerCase();
  const lowerUrl = url.toLowerCase();

  // This is a simplified rule-based approach
  // In production, this would use trained ML models

  // Violence detection
  const violenceKeywords = ['violence', 'fight', 'war', 'kill', 'murder', 'blood', 'gore'];
  if (violenceKeywords.some((kw) => lowerText.includes(kw) || lowerUrl.includes(kw))) {
    if (lowerText.includes('graphic') || lowerText.includes('gore')) {
      return { categoryId: 'violence', contentTypeId: 'graphic-violence' };
    }
    return { categoryId: 'violence', contentTypeId: 'non-graphic-violence' };
  }

  // Sexual content
  const sexualKeywords = ['sex', 'porn', 'nude', 'explicit', 'adult'];
  if (sexualKeywords.some((kw) => lowerText.includes(kw) || lowerUrl.includes(kw))) {
    if (lowerText.includes('education') || lowerText.includes('medical')) {
      return { categoryId: 'sexual', contentTypeId: 'sexual-education' };
    }
    return { categoryId: 'sexual', contentTypeId: 'explicit-sexual' };
  }

  // Substances
  const substanceKeywords = ['drug', 'cigarette', 'alcohol', 'beer', 'wine', 'smoke'];
  if (substanceKeywords.some((kw) => lowerText.includes(kw) || lowerUrl.includes(kw))) {
    if (lowerText.includes('drug') || lowerText.includes('cigarette')) {
      return { categoryId: 'substances', contentTypeId: 'drugs-cigarettes' };
    }
    return { categoryId: 'substances', contentTypeId: 'alcohol' };
  }

  // Gambling
  if (lowerText.includes('gambl') || lowerText.includes('bet') || lowerText.includes('poker') || lowerText.includes('casino')) {
    return { categoryId: 'substances', contentTypeId: 'gambling' };
  }

  // Financial
  const financialKeywords = ['crypto', 'bitcoin', 'get rich', 'dropship', 'investment'];
  if (financialKeywords.some((kw) => lowerText.includes(kw) || lowerUrl.includes(kw))) {
    if (lowerText.includes('crypto') || lowerText.includes('bitcoin')) {
      return { categoryId: 'financial', contentTypeId: 'crypto' };
    }
    return { categoryId: 'financial', contentTypeId: 'get-rich-quick' };
  }

  // Weapons
  if (lowerText.includes('gun') || lowerText.includes('weapon') || lowerText.includes('bomb')) {
    return { categoryId: 'weapons', contentTypeId: 'guns-weapons' };
  }

  // Short-form videos (check URL patterns)
  if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('instagram.com/reel') || lowerUrl.includes('youtube.com/shorts')) {
    return { categoryId: 'media', contentTypeId: 'short-form-videos' };
  }

  // Live streams
  if (lowerText.includes('live stream') || lowerUrl.includes('twitch.tv')) {
    return { categoryId: 'media', contentTypeId: 'live-streams' };
  }

  // Default: allow (conservative approach - only block what we're sure about)
  return null;
}

/**
 * Main filtering function that determines if content should be blocked
 */
export function shouldBlockContent(
  url: string,
  content: string,
  ageGroup: AgeGroup,
  customControls: CustomParentControl[],
  metadata?: { title?: string; description?: string }
): {
  blocked: boolean;
  action: AccessAction;
  categoryId: string | null;
  contentTypeId: string | null;
  reason: string;
} {
  // Check custom controls first (they take precedence)
  const customCheck = checkCustomControls(url, content, customControls);
  if (customCheck.blocked || customCheck.action) {
    return {
      blocked: customCheck.action === 'Block',
      action: customCheck.action || 'Block',
      categoryId: null,
      contentTypeId: null,
      reason: `Custom control: ${customCheck.control?.type} - ${customCheck.control?.value}`,
    };
  }

  // Analyze content to determine category
  const analysis = analyzeContent(url, content, metadata);
  if (!analysis) {
    // Content doesn't match any category - allow by default
    return {
      blocked: false,
      action: 'ALLOW',
      categoryId: null,
      contentTypeId: null,
      reason: 'Content does not match any restricted category',
    };
  }

  // Get access action based on age group
  const action = getAccessAction(analysis.categoryId, analysis.contentTypeId, ageGroup);
  if (!action) {
    return {
      blocked: false,
      action: 'ALLOW',
      categoryId: analysis.categoryId,
      contentTypeId: analysis.contentTypeId,
      reason: 'No rule found for this content type',
    };
  }

  return {
    blocked: action === 'BLOCK',
    action,
    categoryId: analysis.categoryId,
    contentTypeId: analysis.contentTypeId,
    reason: `Category: ${analysis.categoryId}, Type: ${analysis.contentTypeId}`,
  };
}

