// Age groups matching the specification
export type AgeGroup = 'UNDER_10' | 'AGE_10_13' | 'AGE_13_16' | 'AGE_16_18' | 'AGE_18_PLUS';

// Display-friendly age group labels
export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  UNDER_10: 'Under 10',
  AGE_10_13: '10-13',
  AGE_13_16: '13-16',
  AGE_16_18: '16-18',
  AGE_18_PLUS: '18+',
};

export type AccessAction = 'BLOCK' | 'GATE' | 'ALLOW';

export type GateMode = 'warning' | 'delay' | 'parent_approval';

export type ContextLabel = 
  | 'educational' 
  | 'promotional' 
  | 'glorification' 
  | 'discussion' 
  | 'instruction'
  | 'news'
  | 'historical'
  | 'recruitment'
  | 'propaganda'
  | 'help-seeking'
  | 'encouragement';

export interface AgeGroupRule {
  UNDER_10: AccessAction;
  AGE_10_13: AccessAction;
  AGE_13_16: AccessAction;
  AGE_16_18: AccessAction;
  AGE_18_PLUS: AccessAction; // Always ALLOW by default, but included for completeness
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  contentTypes: ContentType[];
  parentConfigurable?: boolean; // For categories like Social & Cultural Topics
}

export interface ContentType {
  id: string;
  name: string;
  rules: AgeGroupRule;
  notes?: string; // Special notes (e.g., "Prefer making unplayable rather than blocking entire site")
}

export interface CustomParentControl {
  id: string;
  type: 'interest' | 'url' | 'keyword';
  value: string;
  action: AccessAction;
  childId?: string;
}

export interface CategoryOverride {
  id: string;
  categoryId: string;
  contentTypeId?: string; // If undefined, applies to entire category
  ageGroup: AgeGroup;
  action: AccessAction;
  gateMode?: GateMode; // For GATE actions
}

export interface ChildProfile {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  customControls: CustomParentControl[];
  categoryOverrides: CategoryOverride[]; // Per-child policy exceptions
  notificationEnabled: boolean;
  defaultGateMode: GateMode; // Default gate mode for this child
}

export interface ContentClassification {
  categoryId: string;
  contentTypeId: string;
  confidence: number; // 0-1
  contextLabel?: ContextLabel;
  recommendedAction: Record<AgeGroup, AccessAction>;
}

export interface BlockedAttempt {
  id: string;
  childId: string;
  timestamp: Date;
  url: string;
  category: string;
  contentType: string;
  action: AccessAction;
  contextLabel?: ContextLabel;
  confidence?: number;
  gateMode?: GateMode;
  parentAction?: 'approved_once' | 'approved_24h' | 'always_allow' | 'blocked';
}

export interface AuditLogEntry {
  id: string;
  childId: string;
  timestamp: Date;
  type: 'blocked_attempt' | 'approval' | 'override' | 'rule_change' | 'custom_control';
  details: {
    url?: string;
    category?: string;
    contentType?: string;
    action?: AccessAction;
    parentAction?: string;
    ruleChange?: string;
  };
}

