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
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate structure
          if (parsed && typeof parsed === 'object') {
            return {
              hasPassword: Boolean(parsed.hasPassword),
              passwordHash: typeof parsed.passwordHash === 'string' ? parsed.passwordHash : '',
              hint: typeof parsed.hint === 'string' ? parsed.hint : undefined,
            };
          }
        }
      } catch (error) {
        console.error('Error reading password config from localStorage:', error);
      }
      return { hasPassword: false, passwordHash: '' };
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome storage error:', chrome.runtime.lastError);
            resolve({ hasPassword: false, passwordHash: '' });
            return;
          }
          if (result[STORAGE_KEY] && typeof result[STORAGE_KEY] === 'object') {
            const config = result[STORAGE_KEY];
            resolve({
              hasPassword: Boolean(config.hasPassword),
              passwordHash: typeof config.passwordHash === 'string' ? config.passwordHash : '',
              hint: typeof config.hint === 'string' ? config.hint : undefined,
            });
          } else {
            resolve({ hasPassword: false, passwordHash: '' });
          }
        });
      } catch (error) {
        console.error('Error in getPasswordConfig:', error);
        resolve({ hasPassword: false, passwordHash: '' });
      }
    });
  }

  async setPassword(password: string, hint?: string): Promise<void> {
    // Validate input
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters long');
    }

    try {
      const passwordHash = await hashPassword(password);
      const config: PasswordConfig = {
        hasPassword: true,
        passwordHash,
        hint: hint && typeof hint === 'string' ? hint.trim().slice(0, 200) : undefined,
      };

      if (!this.isChromeExtension()) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
          console.error('Error writing password to localStorage:', error);
          throw new Error('Failed to save password');
        }
        return;
      }

      return new Promise((resolve, reject) => {
        try {
          chrome.storage.sync.set({ [STORAGE_KEY]: config }, () => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError);
              reject(new Error('Failed to save password'));
              return;
            }
            resolve();
          });
        } catch (error) {
          console.error('Error in setPassword:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    if (!password || typeof password !== 'string') {
      return false;
    }

    try {
      const config = await this.getPasswordConfig();
      if (!config.hasPassword || !config.passwordHash) {
        return true; // No password set, allow access
      }

      const inputHash = await hashPassword(password);
      return inputHash === config.passwordHash;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
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

