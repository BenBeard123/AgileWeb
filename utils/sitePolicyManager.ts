/**
 * V2: Per-app/per-site policy management
 * Allows parents to set specific policies for individual sites or apps
 */

import { AgeGroup, AccessAction, GateMode } from '@/types';

export interface SitePolicy {
  id: string;
  sitePattern: string; // URL pattern or app identifier
  type: 'url' | 'app' | 'domain';
  ageGroup: AgeGroup;
  action: AccessAction;
  gateMode?: GateMode;
  notes?: string;
}

/**
 * Checks if a URL matches a site policy
 */
export function matchesSitePolicy(url: string, policy: SitePolicy): boolean {
  if (!url || !policy) return false;

  const lowerUrl = url.toLowerCase();
  const lowerPattern = policy.sitePattern.toLowerCase();

  switch (policy.type) {
    case 'domain':
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.hostname === lowerPattern || urlObj.hostname.endsWith('.' + lowerPattern);
      } catch {
        return lowerUrl.includes(lowerPattern);
      }

    case 'url':
      return lowerUrl.includes(lowerPattern);

    case 'app':
      // For apps, this would check app identifiers
      return lowerUrl.includes(lowerPattern);

    default:
      return false;
  }
}

/**
 * Finds matching site policies for a URL
 */
export function findMatchingPolicies(
  url: string,
  policies: SitePolicy[]
): SitePolicy[] {
  if (!url || !Array.isArray(policies)) return [];

  return policies.filter(policy => matchesSitePolicy(url, policy));
}

/**
 * Validates a site policy
 */
export function validateSitePolicy(policy: Partial<SitePolicy>): {
  valid: boolean;
  error?: string;
} {
  if (!policy) {
    return { valid: false, error: 'Policy is required' };
  }

  if (!policy.sitePattern || typeof policy.sitePattern !== 'string' || policy.sitePattern.trim().length === 0) {
    return { valid: false, error: 'Site pattern is required' };
  }

  if (!policy.type || !['url', 'app', 'domain'].includes(policy.type)) {
    return { valid: false, error: 'Invalid policy type' };
  }

  if (!policy.ageGroup || !['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'].includes(policy.ageGroup)) {
    return { valid: false, error: 'Invalid age group' };
  }

  if (!policy.action || !['BLOCK', 'GATE', 'ALLOW'].includes(policy.action)) {
    return { valid: false, error: 'Invalid action' };
  }

  if (policy.action === 'GATE' && policy.gateMode && !['warning', 'delay', 'parent_approval'].includes(policy.gateMode)) {
    return { valid: false, error: 'Invalid gate mode' };
  }

  return { valid: true };
}

