// Zustand store with Chrome storage sync for AgileWeb Extension

import { create } from 'zustand';
import { ChildProfile, CustomParentControl, BlockedAttempt, CategoryOverride, AuditLogEntry, GateMode, SitePolicy } from '@/types';
import { ChromeStorageAdapter } from './chromeStorageAdapter';

interface AgileWebStore {
  children: ChildProfile[];
  activeChildId: string | null;
  blockedAttempts: BlockedAttempt[];
  auditLog: AuditLogEntry[];
  sitePolicies: SitePolicy[];
  isLoading: boolean;
  
  // Actions
  setActiveChild: (id: string | null) => Promise<void>;
  addChild: (child: Omit<ChildProfile, 'id'>) => Promise<void>;
  updateChild: (id: string, updates: Partial<ChildProfile>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  addCustomControl: (childId: string, control: Omit<CustomParentControl, 'id'>) => Promise<void>;
  removeCustomControl: (childId: string, controlId: string) => Promise<void>;
  addCategoryOverride: (childId: string, override: Omit<CategoryOverride, 'id'>) => Promise<void>;
  removeCategoryOverride: (childId: string, overrideId: string) => Promise<void>;
  addSitePolicy: (policy: Omit<SitePolicy, 'id'>) => Promise<void>;
  updateSitePolicy: (id: string, updates: Partial<SitePolicy>) => Promise<void>;
  removeSitePolicy: (id: string) => Promise<void>;
  addBlockedAttempt: (attempt: Omit<BlockedAttempt, 'id' | 'timestamp'>) => Promise<void>;
  clearBlockedAttempts: () => Promise<void>;
  addAuditLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => Promise<void>;
  clearAuditLog: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const storageAdapter = ChromeStorageAdapter.getInstance();

export const useChromeStore = create<AgileWebStore>((set, get) => ({
  children: [],
  activeChildId: null,
  blockedAttempts: [],
  auditLog: [],
  sitePolicies: [],
  isLoading: true,

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const data = await storageAdapter.getAll();
      set({
        children: data.children || [],
        activeChildId: data.activeChildId || null,
        blockedAttempts: data.blockedAttempts || [],
        auditLog: data.auditLog || [],
        sitePolicies: data.sitePolicies || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading from storage:', error);
      set({ isLoading: false });
    }
  },

  setActiveChild: async (id: string | null) => {
    await storageAdapter.update({ activeChildId: id });
    set({ activeChildId: id });
  },

  addChild: async (child) => {
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
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      name: child.name.trim().slice(0, 100),
      categoryOverrides: Array.isArray(child.categoryOverrides) ? child.categoryOverrides : [],
      customControls: Array.isArray(child.customControls) ? child.customControls : [],
      sitePolicies: Array.isArray(child.sitePolicies) ? child.sitePolicies : [],
      notificationEnabled: typeof child.notificationEnabled === 'boolean' ? child.notificationEnabled : true,
      defaultGateMode: child.defaultGateMode || 'warning',
    };

    const state = get();
    const limitedChildren = state.children.length >= 20 
      ? [...state.children.slice(0, 19), newChild]
      : [...state.children, newChild];

    const newAuditEntry: AuditLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      childId: newChild.id,
      timestamp: new Date(),
      type: 'rule_change',
      details: { ruleChange: `Created profile for ${newChild.name}` },
    };

    const limitedAuditLog = [newAuditEntry, ...state.auditLog].slice(0, 999);

    await storageAdapter.update({
      children: limitedChildren,
      auditLog: limitedAuditLog,
    });

    set({
      children: limitedChildren,
      auditLog: limitedAuditLog,
    });
  },

  updateChild: async (id, updates) => {
    if (!id || typeof id !== 'string') {
      console.error('Invalid child ID provided');
      return;
    }

    const state = get();
    const child = state.children.find((c) => c.id === id);
    if (!child) {
      console.warn(`Child with ID ${id} not found`);
      return;
    }

    const sanitizedUpdates: Partial<ChildProfile> = {};
    if (updates.name !== undefined) {
      if (typeof updates.name === 'string' && updates.name.trim().length > 0) {
        sanitizedUpdates.name = updates.name.trim().slice(0, 100);
      } else {
        console.error('Invalid name update');
        return;
      }
    }
    if (updates.ageGroup !== undefined) {
      if (['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'].includes(updates.ageGroup)) {
        sanitizedUpdates.ageGroup = updates.ageGroup;
      } else {
        console.error('Invalid ageGroup update');
        return;
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
    if (updates.sitePolicies !== undefined) {
      sanitizedUpdates.sitePolicies = Array.isArray(updates.sitePolicies) ? updates.sitePolicies : child.sitePolicies;
    }

    const updatedChildren = state.children.map((child) =>
      child.id === id ? { ...child, ...sanitizedUpdates } : child
    );

    const newAuditEntry: AuditLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      childId: id,
      timestamp: new Date(),
      type: 'rule_change',
      details: { ruleChange: `Updated profile for ${child.name}` },
    };

    const limitedAuditLog = [newAuditEntry, ...state.auditLog].slice(0, 999);

    await storageAdapter.update({
      children: updatedChildren,
      auditLog: limitedAuditLog,
    });

    set({
      children: updatedChildren,
      auditLog: limitedAuditLog,
    });
  },

  deleteChild: async (id) => {
    const state = get();
    const updatedChildren = state.children.filter((child) => child.id !== id);
    
    // If deleted child was active, clear active child
    const newActiveChildId = state.activeChildId === id ? null : state.activeChildId;

    await storageAdapter.update({
      children: updatedChildren,
      activeChildId: newActiveChildId,
    });

    set({
      children: updatedChildren,
      activeChildId: newActiveChildId,
    });
  },

  addCustomControl: async (childId, control) => {
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

    const state = get();
    const child = state.children.find((c) => c.id === childId);
    if (!child) {
      console.warn(`Child with ID ${childId} not found`);
      return;
    }

    // Check for duplicates
    const isDuplicate = child.customControls.some(
      (c) => c.type === control.type && c.value.toLowerCase() === sanitizedValue.toLowerCase()
    );
    if (isDuplicate) {
      console.warn('Duplicate control detected');
      return;
    }

    // Limit custom controls per child (max 100)
    const currentControls = child.customControls || [];
    const limitedControls = currentControls.length >= 100 
      ? [...currentControls.slice(0, 99), newControl]
      : [...currentControls, newControl];

    const updatedChildren = state.children.map((child) =>
      child.id === childId
        ? {
            ...child,
            customControls: limitedControls,
          }
        : child
    );

    const newAuditEntry: AuditLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      childId,
      timestamp: new Date(),
      type: 'custom_control',
      details: {
        action: control.action,
        ruleChange: `Added ${control.type} control: ${sanitizedValue}`,
      },
    };

    const limitedAuditLog = [newAuditEntry, ...state.auditLog].slice(0, 999);

    await storageAdapter.update({
      children: updatedChildren,
      auditLog: limitedAuditLog,
    });

    set({
      children: updatedChildren,
      auditLog: limitedAuditLog,
    });
  },

  removeCustomControl: async (childId, controlId) => {
    const state = get();
    const child = state.children.find((c) => c.id === childId);
    const control = child?.customControls.find((c) => c.id === controlId);

    const updatedChildren = state.children.map((child) =>
      child.id === childId
        ? {
            ...child,
            customControls: child.customControls.filter(
              (control) => control.id !== controlId
            ),
          }
        : child
    );

    const newAuditEntry = control
      ? {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          childId,
          timestamp: new Date(),
          type: 'custom_control',
          details: {
            ruleChange: `Removed ${control.type} control: ${control.value}`,
          },
        }
      : null;

    const limitedAuditLog = newAuditEntry
      ? [newAuditEntry, ...state.auditLog].slice(0, 999)
      : state.auditLog;

    await storageAdapter.update({
      children: updatedChildren,
      auditLog: limitedAuditLog,
    });

    set({
      children: updatedChildren,
      auditLog: limitedAuditLog,
    });
  },

  addCategoryOverride: async (childId, override) => {
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

    const state = get();
    const child = state.children.find((c) => c.id === childId);
    if (!child) {
      console.warn(`Child with ID ${childId} not found`);
      return;
    }

    // Check for duplicates
    const isDuplicate = child.categoryOverrides.some(
      (o) => o.categoryId === override.categoryId && 
             o.contentTypeId === override.contentTypeId &&
             o.ageGroup === override.ageGroup
    );
    if (isDuplicate) {
      console.warn('Duplicate category override detected');
      return;
    }

    // Limit overrides per child (max 50)
    const currentOverrides = child.categoryOverrides || [];
    const limitedOverrides = currentOverrides.length >= 50 
      ? [...currentOverrides.slice(0, 49), newOverride]
      : [...currentOverrides, newOverride];

    const updatedChildren = state.children.map((child) =>
      child.id === childId
        ? {
            ...child,
            categoryOverrides: limitedOverrides,
          }
        : child
    );

    const newAuditEntry: AuditLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      childId,
      timestamp: new Date(),
      type: 'override',
      details: {
        category: override.categoryId,
        contentType: override.contentTypeId,
        action: override.action,
      },
    };

    const limitedAuditLog = [newAuditEntry, ...state.auditLog].slice(0, 999);

    await storageAdapter.update({
      children: updatedChildren,
      auditLog: limitedAuditLog,
    });

    set({
      children: updatedChildren,
      auditLog: limitedAuditLog,
    });
  },

  removeCategoryOverride: async (childId, overrideId) => {
    const state = get();
    const updatedChildren = state.children.map((child) =>
      child.id === childId
        ? {
            ...child,
            categoryOverrides: child.categoryOverrides.filter(
              (override) => override.id !== overrideId
            ),
          }
        : child
    );

    await storageAdapter.update({
      children: updatedChildren,
    });

    set({
      children: updatedChildren,
    });
  },

  addSitePolicy: async (policy) => {
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
      notes: policy.notes?.trim().slice(0, 1000) || '',
    };

    const state = get();
    const limitedSitePolicies = state.sitePolicies.length >= 200 
      ? [...state.sitePolicies.slice(0, 199), newPolicy]
      : [...state.sitePolicies, newPolicy];

    const newAuditEntry: AuditLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      childId: policy.childId || 'global',
      timestamp: new Date(),
      type: 'site_policy',
      details: {
        ruleChange: `Added site policy: ${newPolicy.sitePattern} (${newPolicy.type})`,
        action: newPolicy.action,
      },
    };

    const limitedAuditLog = [newAuditEntry, ...state.auditLog].slice(0, 999);

    await storageAdapter.update({
      sitePolicies: limitedSitePolicies,
      auditLog: limitedAuditLog,
    });

    set({
      sitePolicies: limitedSitePolicies,
      auditLog: limitedAuditLog,
    });
  },

  updateSitePolicy: async (id, updates) => {
    if (!id || typeof id !== 'string') {
      console.error('Invalid policy ID');
      return;
    }

    const state = get();
    const policy = state.sitePolicies.find((p) => p.id === id);
    if (!policy) {
      console.warn(`Site policy with ID ${id} not found`);
      return;
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

    const updatedPolicies = state.sitePolicies.map((p) =>
      p.id === id ? { ...p, ...sanitizedUpdates } : p
    );

    const newAuditEntry: AuditLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      childId: policy.childId || 'global',
      timestamp: new Date(),
      type: 'site_policy',
      details: {
        ruleChange: `Updated site policy: ${policy.sitePattern}`,
      },
    };

    const limitedAuditLog = [newAuditEntry, ...state.auditLog].slice(0, 999);

    await storageAdapter.update({
      sitePolicies: updatedPolicies,
      auditLog: limitedAuditLog,
    });

    set({
      sitePolicies: updatedPolicies,
      auditLog: limitedAuditLog,
    });
  },

  removeSitePolicy: async (id) => {
    const state = get();
    const policy = state.sitePolicies.find((p) => p.id === id);
    const updatedPolicies = state.sitePolicies.filter((p) => p.id !== id);

    const newAuditEntry = policy
      ? {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          childId: policy.childId || 'global',
          timestamp: new Date(),
          type: 'site_policy',
          details: {
            ruleChange: `Removed site policy: ${policy.sitePattern}`,
          },
        }
      : null;

    const limitedAuditLog = newAuditEntry
      ? [newAuditEntry, ...state.auditLog].slice(0, 999)
      : state.auditLog;

    await storageAdapter.update({
      sitePolicies: updatedPolicies,
      auditLog: limitedAuditLog,
    });

    set({
      sitePolicies: updatedPolicies,
      auditLog: limitedAuditLog,
    });
  },

  addBlockedAttempt: async (attempt) => {
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

    const state = get();
    const limitedAttempts = [newAttempt, ...state.blockedAttempts].slice(0, 1000);

    const newAuditEntry: AuditLogEntry = {
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
    };

    const limitedAuditLog = [newAuditEntry, ...state.auditLog].slice(0, 999);

    await storageAdapter.update({
      blockedAttempts: limitedAttempts,
      auditLog: limitedAuditLog,
    });

    set({
      blockedAttempts: limitedAttempts,
      auditLog: limitedAuditLog,
    });
  },

  clearBlockedAttempts: async () => {
    await storageAdapter.update({ blockedAttempts: [] });
    set({ blockedAttempts: [] });
  },

  addAuditLogEntry: async (entry) => {
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

    const state = get();
    const limitedAuditLog = [newEntry, ...state.auditLog].slice(0, 999);

    await storageAdapter.update({
      auditLog: limitedAuditLog,
    });

    set({
      auditLog: limitedAuditLog,
    });
  },

  clearAuditLog: async () => {
    await storageAdapter.update({ auditLog: [] });
    set({ auditLog: [] });
  },
}));

// Initialize store from storage on load
if (typeof window !== 'undefined') {
  useChromeStore.getState().loadFromStorage();
  
  // Listen for storage changes
  storageAdapter.addListener((data) => {
    useChromeStore.setState({
      children: data.children || [],
      activeChildId: data.activeChildId || null,
      blockedAttempts: data.blockedAttempts || [],
      auditLog: data.auditLog || [],
      sitePolicies: data.sitePolicies || [],
    });
  });
}

