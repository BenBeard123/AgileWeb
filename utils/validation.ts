/**
 * Validation utilities for AgileWeb
 */

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // Check if it's a valid URL pattern even without protocol
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    return urlPattern.test(url);
  }
}

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  // Remove potentially dangerous characters but keep URL structure
  return url.trim().replace(/[\x00-\x1F\x7F]/g, '');
}

export function isValidAgeGroup(ageGroup: string): ageGroup is import('@/types').AgeGroup {
  const validAgeGroups = ['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'];
  return validAgeGroups.includes(ageGroup);
}

export function isValidAccessAction(action: string): action is import('@/types').AccessAction {
  const validActions = ['BLOCK', 'GATE', 'ALLOW'];
  return validActions.includes(action);
}

export function isValidGateMode(mode: string): mode is import('@/types').GateMode {
  const validModes = ['warning', 'delay', 'parent_approval'];
  return validModes.includes(mode);
}

export function validateChildName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: 'Name must be 100 characters or less' };
  }
  // Check for potentially dangerous characters
  if (/[<>\"'&]/.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  return { valid: true };
}

export function validateControlValue(
  value: string,
  type: 'interest' | 'url' | 'keyword'
): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Value is required' };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Value cannot be empty' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: 'Value must be 500 characters or less' };
  }

  if (type === 'url') {
    if (!isValidUrl(trimmed)) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  if (type === 'keyword') {
    // Keywords should be single words or short phrases
    if (trimmed.split(/\s+/).length > 5) {
      return { valid: false, error: 'Keywords should be short phrases (5 words or less)' };
    }
  }

  return { valid: true };
}

export function safeStringComparison(str1: string | null | undefined, str2: string | null | undefined): boolean {
  if (!str1 || !str2) return false;
  return str1.toLowerCase().trim() === str2.toLowerCase().trim();
}

