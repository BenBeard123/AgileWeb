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
      try {
        const stored = localStorage.getItem('agileweb-data');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate structure
          return {
            children: Array.isArray(parsed.children) ? parsed.children : [],
            activeChildId: parsed.activeChildId || null,
            blockedAttempts: Array.isArray(parsed.blockedAttempts) ? parsed.blockedAttempts : [],
            auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : [],
            sitePolicies: Array.isArray(parsed.sitePolicies) ? parsed.sitePolicies : [],
          };
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
      return {
        children: [],
        activeChildId: null,
        blockedAttempts: [],
        auditLog: [],
        sitePolicies: [],
      };
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(['children', 'activeChildId', 'blockedAttempts', 'auditLog', 'sitePolicies'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome storage error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          resolve({
            children: Array.isArray(result.children) ? result.children : [],
            activeChildId: result.activeChildId || null,
            blockedAttempts: Array.isArray(result.blockedAttempts) ? result.blockedAttempts : [],
            auditLog: Array.isArray(result.auditLog) ? result.auditLog : [],
            sitePolicies: Array.isArray(result.sitePolicies) ? result.sitePolicies : [],
          });
        });
      } catch (error) {
        console.error('Error in getAll:', error);
        reject(error);
      }
    });
  }

  // Set all data to Chrome storage
  async setAll(data: ChromeStorageData): Promise<void> {
    // Validate data structure
    const validatedData: ChromeStorageData = {
      children: Array.isArray(data.children) ? data.children : [],
      activeChildId: data.activeChildId || null,
      blockedAttempts: Array.isArray(data.blockedAttempts) ? data.blockedAttempts : [],
      auditLog: Array.isArray(data.auditLog) ? data.auditLog : [],
      sitePolicies: Array.isArray(data.sitePolicies) ? data.sitePolicies : [],
    };

    if (!this.isChromeExtension()) {
      // Fallback to localStorage for web app
      try {
        localStorage.setItem('agileweb-data', JSON.stringify(validatedData));
        this.notifyListeners(validatedData);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
        throw error;
      }
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set(validatedData, () => {
          if (chrome.runtime.lastError) {
            console.error('Chrome storage error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          this.notifyListeners(validatedData);
          resolve();
        });
      } catch (error) {
        console.error('Error in setAll:', error);
        reject(error);
      }
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
          // Immediately notify listeners when storage changes
          this.getAll().then(callback);
        }
      });
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  // Force sync - ensures data is written and synced immediately
  async forceSync(): Promise<void> {
    if (!this.isChromeExtension()) {
      return;
    }

    // Chrome sync happens automatically, but we can trigger a read to ensure sync
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, () => {
        resolve();
      });
    });
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

