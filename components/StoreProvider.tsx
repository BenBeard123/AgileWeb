'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useChromeStore } from '@/store/useChromeStore';

// Detect if running in Chrome extension context
function isChromeExtension(): boolean {
  return typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.storage !== undefined;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isExtension, setIsExtension] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkExtension = async () => {
      const extension = isChromeExtension();
      setIsExtension(extension);
      
      if (extension) {
        // Load data from Chrome storage
        await useChromeStore.getState().loadFromStorage();
      }
      
      setIsLoading(false);
    };

    checkExtension();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AgileWeb...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to get the appropriate store
export function useAppStore() {
  const isExtension = typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.storage !== undefined;
  
  if (isExtension) {
    return useChromeStore();
  }
  
  return useStore();
}

