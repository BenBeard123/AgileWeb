import { create } from 'zustand';
import { ChildProfile, CustomParentControl, BlockedAttempt, CategoryOverride, AuditLogEntry, GateMode } from '@/types';

interface AgileWebStore {
  children: ChildProfile[];
  blockedAttempts: BlockedAttempt[];
  auditLog: AuditLogEntry[];
  addChild: (child: Omit<ChildProfile, 'id'>) => void;
  updateChild: (id: string, updates: Partial<ChildProfile>) => void;
  deleteChild: (id: string) => void;
  addCustomControl: (childId: string, control: Omit<CustomParentControl, 'id'>) => void;
  removeCustomControl: (childId: string, controlId: string) => void;
  addCategoryOverride: (childId: string, override: Omit<CategoryOverride, 'id'>) => void;
  removeCategoryOverride: (childId: string, overrideId: string) => void;
  addBlockedAttempt: (attempt: Omit<BlockedAttempt, 'id' | 'timestamp'>) => void;
  clearBlockedAttempts: () => void;
  addAuditLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearAuditLog: () => void;
}

export const useStore = create<AgileWebStore>((set) => ({
  children: [],
  blockedAttempts: [],
  auditLog: [],
  
  addChild: (child) => {
    const newChild: ChildProfile = {
      ...child,
      id: Date.now().toString(),
      categoryOverrides: child.categoryOverrides || [],
      customControls: child.customControls || [],
    };
    set((state) => ({
      children: [...state.children, newChild],
      auditLog: [
        {
          id: Date.now().toString(),
          childId: newChild.id,
          timestamp: new Date(),
          type: 'rule_change',
          details: { ruleChange: `Created profile for ${newChild.name}` },
        },
        ...state.auditLog,
      ],
    }));
  },
  
  updateChild: (id, updates) => {
    set((state) => {
      const child = state.children.find((c) => c.id === id);
      return {
        children: state.children.map((child) =>
          child.id === id ? { ...child, ...updates } : child
        ),
        auditLog: child
          ? [
              {
                id: Date.now().toString(),
                childId: id,
                timestamp: new Date(),
                type: 'rule_change',
                details: { ruleChange: `Updated profile for ${child.name}` },
              },
              ...state.auditLog,
            ]
          : state.auditLog,
      };
    });
  },
  
  deleteChild: (id) => {
    set((state) => ({
      children: state.children.filter((child) => child.id !== id),
    }));
  },
  
  addCustomControl: (childId, control) => {
    const newControl: CustomParentControl = {
      ...control,
      id: Date.now().toString(),
      childId,
    };
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId
          ? {
              ...child,
              customControls: [...child.customControls, newControl],
            }
          : child
      ),
      auditLog: [
        {
          id: Date.now().toString(),
          childId,
          timestamp: new Date(),
          type: 'custom_control',
          details: {
            action: control.action,
            ruleChange: `Added ${control.type} control: ${control.value}`,
          },
        },
        ...state.auditLog,
      ],
    }));
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
                id: Date.now().toString(),
                childId,
                timestamp: new Date(),
                type: 'custom_control',
                details: {
                  ruleChange: `Removed ${control.type} control: ${control.value}`,
                },
              },
              ...state.auditLog,
            ]
          : state.auditLog,
      };
    });
  },
  
  addCategoryOverride: (childId, override) => {
    const newOverride: CategoryOverride = {
      ...override,
      id: Date.now().toString(),
    } as CategoryOverride;
    set((state) => ({
      children: state.children.map((child) =>
        child.id === childId
          ? {
              ...child,
              categoryOverrides: [...child.categoryOverrides, newOverride],
            }
          : child
      ),
      auditLog: [
        {
          id: Date.now().toString(),
          childId,
          timestamp: new Date(),
          type: 'override',
          details: {
            category: override.categoryId,
            contentType: override.contentTypeId,
            action: override.action,
          },
        },
        ...state.auditLog,
      ],
    }));
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
    const newAttempt: BlockedAttempt = {
      ...attempt,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    set((state) => ({
      blockedAttempts: [newAttempt, ...state.blockedAttempts],
      auditLog: [
        {
          id: Date.now().toString(),
          childId: attempt.childId,
          timestamp: new Date(),
          type: 'blocked_attempt',
          details: {
            url: attempt.url,
            category: attempt.category,
            contentType: attempt.contentType,
            action: attempt.action,
          },
        },
        ...state.auditLog,
      ],
    }));
  },
  
  clearBlockedAttempts: () => {
    set({ blockedAttempts: [] });
  },
  
  addAuditLogEntry: (entry) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    set((state) => ({
      auditLog: [newEntry, ...state.auditLog],
    }));
  },
  
  clearAuditLog: () => {
    set({ auditLog: [] });
  },
}));

