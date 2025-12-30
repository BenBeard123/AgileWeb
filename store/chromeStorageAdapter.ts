// Chrome Storage Adapter for AgileWeb
// This adapter syncs Zustand store with Chrome storage for the extension

import { ChildProfile, CustomParentControl, BlockedAttempt, CategoryOverride, AuditLogEntry, SitePolicy } from '@/types';

export interface ChromeStorageData {
  children: ChildProfile[];
  activeChildId: string | null;
  blockedAttempts: BlockedAttempt[];
  auditLog: AuditLogEntry[];
  sitePolicies: SitePolicy[];
}

export class ChromeStorageAdapter {
  private static instance: ChromeStorageAdapter;
  private listeners: Set<(data: ChromeStorageData) => void> = new Set();

  static getInstance(): ChromeStorageAdapter {
    if (!ChromeStorageAdapter.instance) {
      ChromeStorageAdapter.instance = new ChromeStorageAdapter();
    }
    return ChromeStorageAdapter.instance;
  }

  // Check if running in Chrome extension context
  isChromeExtension(): boolean {
    return typeof chrome !== 'undefined' && chrome.storage !== undefined;
  }

  // Get all data from Chrome storage
  async getAll(): Promise<ChromeStorageData> {
    if (!this.isChromeExtension()) {
      // Fallback to localStorage for web app
      const stored = localStorage.getItem('agileweb-data');
      if (stored) {
        return JSON.parse(stored);
      }
      return {
        children: [],
        activeChildId: null,
        blockedAttempts: [],
        auditLog: [],
        sitePolicies: [],
      };
    }

    return new Promise((resolve) => {
      chrome.storage.sync.get(['children', 'activeChildId', 'blockedAttempts', 'auditLog', 'sitePolicies'], (result) => {
        resolve({
          children: result.children || [],
          activeChildId: result.activeChildId || null,
          blockedAttempts: result.blockedAttempts || [],
          auditLog: result.auditLog || [],
          sitePolicies: result.sitePolicies || [],
        });
      });
    });
  }

  // Set all data to Chrome storage
  async setAll(data: ChromeStorageData): Promise<void> {
    if (!this.isChromeExtension()) {
      // Fallback to localStorage for web app
      localStorage.setItem('agileweb-data', JSON.stringify(data));
      this.notifyListeners(data);
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.sync.set(data, () => {
        this.notifyListeners(data);
        resolve();
      });
    });
  }

  // Update specific fields
  async update(updates: Partial<ChromeStorageData>): Promise<void> {
    const current = await this.getAll();
    const updated = { ...current, ...updates };
    await this.setAll(updated);
  }

  // Add listener for storage changes
  addListener(callback: (data: ChromeStorageData) => void): () => void {
    this.listeners.add(callback);
    
    // Also listen to Chrome storage changes
    if (this.isChromeExtension()) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync') {
          this.getAll().then(callback);
        }
      });
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(data: ChromeStorageData): void {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in storage listener:', error);
      }
    });
  }
}

