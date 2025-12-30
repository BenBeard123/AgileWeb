// Password/Code Manager for Parental Controls
// Prevents children from disabling or uninstalling the extension

export interface PasswordConfig {
  hasPassword: boolean;
  passwordHash: string; // SHA-256 hash of the password
  hint?: string; // Optional hint for parents
}

const STORAGE_KEY = 'agileweb_parental_password';

// Simple hash function (for demo - in production use crypto.subtle)
async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

export class PasswordManager {
  private static instance: PasswordManager;

  static getInstance(): PasswordManager {
    if (!PasswordManager.instance) {
      PasswordManager.instance = new PasswordManager();
    }
    return PasswordManager.instance;
  }

  isChromeExtension(): boolean {
    return typeof chrome !== 'undefined' && chrome.storage !== undefined;
  }

  async getPasswordConfig(): Promise<PasswordConfig> {
    if (!this.isChromeExtension()) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return { hasPassword: false, passwordHash: '' };
    }

    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          resolve(result[STORAGE_KEY]);
        } else {
          resolve({ hasPassword: false, passwordHash: '' });
        }
      });
    });
  }

  async setPassword(password: string, hint?: string): Promise<void> {
    const passwordHash = await hashPassword(password);
    const config: PasswordConfig = {
      hasPassword: true,
      passwordHash,
      hint,
    };

    if (!this.isChromeExtension()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: config }, () => {
        resolve();
      });
    });
  }

  async verifyPassword(password: string): Promise<boolean> {
    const config = await this.getPasswordConfig();
    if (!config.hasPassword) {
      return true; // No password set, allow access
    }

    const inputHash = await hashPassword(password);
    return inputHash === config.passwordHash;
  }

  async hasPassword(): Promise<boolean> {
    const config = await this.getPasswordConfig();
    return config.hasPassword;
  }

  async clearPassword(): Promise<void> {
    if (!this.isChromeExtension()) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.sync.remove([STORAGE_KEY], () => {
        resolve();
      });
    });
  }

  async getHint(): Promise<string | undefined> {
    const config = await this.getPasswordConfig();
    return config.hint;
  }
}

