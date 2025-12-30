import { create } from 'zustand';
import { ChildProfile, CustomParentControl, BlockedAttempt, CategoryOverride, AuditLogEntry, GateMode, SitePolicy } from '@/types';

interface AgileWebStore {
  children: ChildProfile[];
  blockedAttempts: BlockedAttempt[];
  auditLog: AuditLogEntry[];
  sitePolicies: SitePolicy[]; // V2: Per-app/per-site policies
  addChild: (child: Omit<ChildProfile, 'id'>) => void;
  updateChild: (id: string, updates: Partial<ChildProfile>) => void;
  deleteChild: (id: string) => void;
  addCustomControl: (childId: string, control: Omit<CustomParentControl, 'id'>) => void;
  removeCustomControl: (childId: string, controlId: string) => void;
  addCategoryOverride: (childId: string, override: Omit<CategoryOverride, 'id'>) => void;
  removeCategoryOverride: (childId: string, overrideId: string) => void;
  addSitePolicy: (policy: Omit<SitePolicy, 'id'>) => void; // V2
  updateSitePolicy: (id: string, updates: Partial<SitePolicy>) => void; // V2
  removeSitePolicy: (id: string) => void; // V2
  addBlockedAttempt: (attempt: Omit<BlockedAttempt, 'id' | 'timestamp'>) => void;
  clearBlockedAttempts: () => void;
  addAuditLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearAuditLog: () => void;
}

export const useStore = create<AgileWebStore>((set) => ({
  children: [],
  blockedAttempts: [],
  auditLog: [],
  sitePolicies: [], // V2
  
  addChild: (child) => {
    // Validation
    if (!child || !child.name || typeof child.name !== 'string' || child.name.trim().length === 0) {
      console.error('Invalid child data: name is required');
      return;
    }

    if (!child.ageGroup || !['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'].includes(child.ageGroup)) {
      console.error('Invalid child data: ageGroup is required and must be valid');
      return;
    }

    const newChild: ChildProfile = {
      ...child,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11), // More unique ID
      name: child.name.trim().slice(0, 100), // Sanitize name
      categoryOverrides: Array.isArray(child.categoryOverrides) ? child.categoryOverrides : [],
      customControls: Array.isArray(child.customControls) ? child.customControls : [],
      notificationEnabled: typeof child.notificationEnabled === 'boolean' ? child.notificationEnabled : true,
      defaultGateMode: child.defaultGateMode || 'warning',
    };
    
    set((state) => {
      // Limit children to prevent memory issues (max 20 children)
      const limitedChildren = state.children.length >= 20 
        ? [...state.children.slice(0, 19), newChild]
        : [...state.children, newChild];
      
      return {
        children: limitedChildren,
        auditLog: [
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            childId: newChild.id,
            timestamp: new Date(),
            type: 'rule_change',
            details: { ruleChange: `Created profile for ${newChild.name}` },
          },
          ...state.auditLog.slice(0, 999),
        ],
      };
    });
  },
  
  updateChild: (id, updates) => {
    if (!id || typeof id !== 'string') {
      console.error('Invalid child ID provided');
      return;
    }

    set((state) => {
      const child = state.children.find((c) => c.id === id);
      if (!child) {
        console.warn(`Child with ID ${id} not found`);
        return state;
      }

      // Validate and sanitize updates
      const sanitizedUpdates: Partial<ChildProfile> = {};
      if (updates.name !== undefined) {
        if (typeof updates.name === 'string' && updates.name.trim().length > 0) {
          sanitizedUpdates.name = updates.name.trim().slice(0, 100);
        } else {
          console.error('Invalid name update');
          return state;
        }
      }
      if (updates.ageGroup !== undefined) {
        if (['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'].includes(updates.ageGroup)) {
          sanitizedUpdates.ageGroup = updates.ageGroup;
        } else {
          console.error('Invalid ageGroup update');
          return state;
        }
      }
      if (updates.notificationEnabled !== undefined) {
        sanitizedUpdates.notificationEnabled = Boolean(updates.notificationEnabled);
      }
      if (updates.defaultGateMode !== undefined) {
        if (['warning', 'delay', 'parent_approval'].includes(updates.defaultGateMode)) {
          sanitizedUpdates.defaultGateMode = updates.defaultGateMode;
        }
      }
      if (updates.categoryOverrides !== undefined) {
        sanitizedUpdates.categoryOverrides = Array.isArray(updates.categoryOverrides) ? updates.categoryOverrides : child.categoryOverrides;
      }
      if (updates.customControls !== undefined) {
        sanitizedUpdates.customControls = Array.isArray(updates.customControls) ? updates.customControls : child.customControls;
      }

      return {
        children: state.children.map((child) =>
          child.id === id ? { ...child, ...sanitizedUpdates } : child
        ),
        auditLog: [
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            childId: id,
            timestamp: new Date(),
            type: 'rule_change',
            details: { ruleChange: `Updated profile for ${child.name}` },
          },
          ...state.auditLog.slice(0, 999),
        ],
      };
    });
  },
  
  deleteChild: (id) => {
    set((state) => ({
      children: state.children.filter((child) => child.id !== id),
    }));
  },
  
  addCustomControl: (childId, control) => {
    // Validation
    if (!childId || typeof childId !== 'string') {
      console.error('Invalid childId provided');
      return;
    }

    if (!control || !control.type || !['interest', 'url', 'keyword'].includes(control.type)) {
      console.error('Invalid control type');
      return;
    }

    if (!control.value || typeof control.value !== 'string' || control.value.trim().length === 0) {
      console.error('Invalid control value');
      return;
    }

    if (!control.action || !['BLOCK', 'GATE', 'ALLOW'].includes(control.action)) {
      console.error('Invalid control action');
      return;
    }

    const sanitizedValue = control.value.trim().slice(0, 500);
    const newControl: CustomParentControl = {
      ...control,
      value: sanitizedValue,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      childId,
    };

    set((state) => {
      const child = state.children.find((c) => c.id === childId);
      if (!child) {
        console.warn(`Child with ID ${childId} not found`);
        return state;
      }

      // Check for duplicates
      const isDuplicate = child.customControls.some(
        (c) => c.type === control.type && c.value.toLowerCase() === sanitizedValue.toLowerCase()
      );
      if (isDuplicate) {
        console.warn('Duplicate control detected');
        return state;
      }

      // Limit custom controls per child (max 100)
      const currentControls = child.customControls || [];
      const limitedControls = currentControls.length >= 100 
        ? [...currentControls.slice(0, 99), newControl]
        : [...currentControls, newControl];

      return {
        children: state.children.map((child) =>
          child.id === childId
            ? {
                ...child,
                customControls: limitedControls,
              }
            : child
        ),
        auditLog: [
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            childId,
            timestamp: new Date(),
            type: 'custom_control',
            details: {
              action: control.action,
              ruleChange: `Added ${control.type} control: ${sanitizedValue}`,
            },
          },
          ...state.auditLog.slice(0, 999),
        ],
      };
    });
  },
  
  removeCustomControl: (childId, controlId) => {
    set((state) => {
      const child = state.children.find((c) => c.id === childId);
      const control = child?.customControls.find((c) => c.id === controlId);
      return {
        children: state.children.map((child) =>
          child.id === childId
            ? {
                ...child,
                customControls: child.customControls.filter(
                  (control) => control.id !== controlId
                ),
              }
            : child
        ),
        auditLog: control
          ? [
              {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
                childId,
                timestamp: new Date(),
                type: 'custom_control',
                details: {
                  ruleChange: `Removed ${control.type} control: ${control.value}`,
                },
              },
              ...state.auditLog.slice(0, 999),
            ]
          : state.auditLog,
      };
    });
  },
  
  addCategoryOverride: (childId, override) => {
    // Validation
    if (!childId || typeof childId !== 'string') {
      console.error('Invalid childId provided');
      return;
    }

    if (!override || !override.categoryId || typeof override.categoryId !== 'string') {
      console.error('Invalid override: categoryId is required');
      return;
    }

    if (!override.ageGroup || !['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'].includes(override.ageGroup)) {
      console.error('Invalid override: ageGroup is required and must be valid');
      return;
    }

    if (!override.action || !['BLOCK', 'GATE', 'ALLOW'].includes(override.action)) {
      console.error('Invalid override: action is required and must be valid');
      return;
    }

    const newOverride: CategoryOverride = {
      ...override,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
    } as CategoryOverride;
    
    set((state) => {
      const child = state.children.find((c) => c.id === childId);
      if (!child) {
        console.warn(`Child with ID ${childId} not found`);
        return state;
      }

      // Check for duplicates
      const isDuplicate = child.categoryOverrides.some(
        (o) => o.categoryId === override.categoryId && 
               o.contentTypeId === override.contentTypeId &&
               o.ageGroup === override.ageGroup
      );
      if (isDuplicate) {
        console.warn('Duplicate category override detected');
        return state;
      }

      // Limit overrides per child (max 50)
      const currentOverrides = child.categoryOverrides || [];
      const limitedOverrides = currentOverrides.length >= 50 
        ? [...currentOverrides.slice(0, 49), newOverride]
        : [...currentOverrides, newOverride];

      return {
        children: state.children.map((child) =>
          child.id === childId
            ? {
                ...child,
                categoryOverrides: limitedOverrides,
              }
            : child
        ),
        auditLog: [
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            childId,
            timestamp: new Date(),
            type: 'override',
            details: {
              category: override.categoryId,
              contentType: override.contentTypeId,
              action: override.action,
            },
          },
          ...state.auditLog.slice(0, 999),
        ],
      };
    });
  },
  
  removeCategoryOverride: (childId, overrideId) => {
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId
          ? {
              ...child,
              categoryOverrides: child.categoryOverrides.filter(
                (override) => override.id !== overrideId
              ),
            }
          : child
      ),
    }));
  },
  
  addBlockedAttempt: (attempt) => {
    // Validation
    if (!attempt || !attempt.childId || typeof attempt.childId !== 'string') {
      console.error('Invalid attempt: childId is required');
      return;
    }

    if (!attempt.url || typeof attempt.url !== 'string') {
      console.error('Invalid attempt: url is required');
      return;
    }

    if (!attempt.action || !['BLOCK', 'GATE', 'ALLOW'].includes(attempt.action)) {
      console.error('Invalid attempt: action is required and must be valid');
      return;
    }

    const sanitizedUrl = attempt.url.trim().slice(0, 2000);
    const newAttempt: BlockedAttempt = {
      ...attempt,
      url: sanitizedUrl,
      category: attempt.category || 'unknown',
      contentType: attempt.contentType || 'unknown',
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      timestamp: new Date(),
    };

    set((state) => {
      // Limit blocked attempts to prevent memory issues (keep last 1000)
      const limitedAttempts = state.blockedAttempts.slice(0, 999);
      const limitedAuditLog = state.auditLog.slice(0, 999);
      
      // Limit site policies to prevent memory issues (max 200)
      const limitedSitePolicies = state.sitePolicies.length > 200 
        ? state.sitePolicies.slice(0, 200)
        : state.sitePolicies;

      return {
        blockedAttempts: [newAttempt, ...limitedAttempts],
        auditLog: [
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            childId: attempt.childId,
            timestamp: new Date(),
            type: 'blocked_attempt',
            details: {
              url: sanitizedUrl,
              category: attempt.category || 'unknown',
              contentType: attempt.contentType || 'unknown',
              action: attempt.action,
            },
          },
          ...limitedAuditLog,
        ],
        sitePolicies: limitedSitePolicies,
      };
    });
  },
  
  clearBlockedAttempts: () => {
    set({ blockedAttempts: [] });
  },
  
  addAuditLogEntry: (entry) => {
    // Validation
    if (!entry || !entry.childId || typeof entry.childId !== 'string') {
      console.error('Invalid audit log entry: childId is required');
      return;
    }

    const newEntry: AuditLogEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      timestamp: new Date(),
    };
    
    set((state) => {
      // Limit audit log to prevent memory issues (keep last 1000 entries)
      const limitedAuditLog = state.auditLog.slice(0, 999);
      return {
        auditLog: [newEntry, ...limitedAuditLog],
      };
    });
  },
  
  clearAuditLog: () => {
    set({ auditLog: [] });
  },

  // V2: Site policy management
  addSitePolicy: (policy) => {
    // Validation
    if (!policy || !policy.sitePattern || typeof policy.sitePattern !== 'string' || policy.sitePattern.trim().length === 0) {
      console.error('Invalid site policy: sitePattern is required');
      return;
    }

    if (!policy.type || !['url', 'app', 'domain'].includes(policy.type)) {
      console.error('Invalid site policy: type is required and must be valid');
      return;
    }

    if (!policy.action || !['BLOCK', 'GATE', 'ALLOW'].includes(policy.action)) {
      console.error('Invalid site policy: action is required and must be valid');
      return;
    }

    const newPolicy: SitePolicy = {
      ...policy,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      sitePattern: policy.sitePattern.trim().slice(0, 500),
    };

    set((state) => {
      // Limit site policies to prevent memory issues (max 200)
      const limitedSitePolicies = state.sitePolicies.length >= 200 
        ? [...state.sitePolicies.slice(0, 199), newPolicy]
        : [...state.sitePolicies, newPolicy];

      return {
        sitePolicies: limitedSitePolicies,
        auditLog: [
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            childId: policy.childId || 'global',
            timestamp: new Date(),
            type: 'site_policy',
            details: {
              ruleChange: `Added site policy: ${newPolicy.sitePattern} (${newPolicy.type})`,
              action: newPolicy.action,
            },
          },
          ...state.auditLog.slice(0, 999),
        ],
      };
    });
  },

  updateSitePolicy: (id, updates) => {
    if (!id || typeof id !== 'string') {
      console.error('Invalid policy ID');
      return;
    }

    set((state) => {
      const policy = state.sitePolicies.find((p) => p.id === id);
      if (!policy) {
        console.warn(`Site policy with ID ${id} not found`);
        return state;
      }

      const sanitizedUpdates: Partial<SitePolicy> = {};
      if (updates.sitePattern !== undefined) {
        sanitizedUpdates.sitePattern = typeof updates.sitePattern === 'string' 
          ? updates.sitePattern.trim().slice(0, 500) 
          : policy.sitePattern;
      }
      if (updates.type !== undefined && ['url', 'app', 'domain'].includes(updates.type)) {
        sanitizedUpdates.type = updates.type;
      }
      if (updates.action !== undefined && ['BLOCK', 'GATE', 'ALLOW'].includes(updates.action)) {
        sanitizedUpdates.action = updates.action;
      }
      if (updates.ageGroup !== undefined) {
        sanitizedUpdates.ageGroup = updates.ageGroup;
      }
      if (updates.gateMode !== undefined) {
        sanitizedUpdates.gateMode = updates.gateMode;
      }
      if (updates.notes !== undefined) {
        sanitizedUpdates.notes = typeof updates.notes === 'string' ? updates.notes.slice(0, 1000) : undefined;
      }

      return {
        sitePolicies: state.sitePolicies.map((p) =>
          p.id === id ? { ...p, ...sanitizedUpdates } : p
        ),
        auditLog: [
          {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
            childId: policy.childId || 'global',
            timestamp: new Date(),
            type: 'site_policy',
            details: {
              ruleChange: `Updated site policy: ${policy.sitePattern}`,
            },
          },
          ...state.auditLog.slice(0, 999),
        ],
      };
    });
  },

  removeSitePolicy: (id) => {
    set((state) => {
      const policy = state.sitePolicies.find((p) => p.id === id);
      return {
        sitePolicies: state.sitePolicies.filter((p) => p.id !== id),
        auditLog: policy
          ? [
              {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
                childId: policy.childId || 'global',
                timestamp: new Date(),
                type: 'site_policy',
                details: {
                  ruleChange: `Removed site policy: ${policy.sitePattern}`,
                },
              },
              ...state.auditLog.slice(0, 999),
            ]
          : state.auditLog,
      };
    });
  },
}));

