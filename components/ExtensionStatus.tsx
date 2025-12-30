'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ExtensionStatus() {
  const [isExtension, setIsExtension] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkExtension = () => {
      const extension = typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.storage !== undefined;
      setIsExtension(extension);
      
      if (extension) {
        // Test connection to extension
        chrome.storage.sync.get(['children'], (result) => {
          setIsConnected(true);
        });
      }
    };

    checkExtension();
  }, []);

  if (!isExtension) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <XCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Chrome Extension Not Detected</p>
            <p className="text-xs text-yellow-700 mt-1">
              This dashboard works best with the AgileWeb Chrome extension. 
              Settings will be saved locally in your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-800">Chrome Extension Connected</p>
          <p className="text-xs text-green-700 mt-1">
            Settings are syncing with your Chrome extension. Changes will be applied immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

