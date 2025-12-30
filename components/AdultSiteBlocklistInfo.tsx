'use client';

import { Shield, Info } from 'lucide-react';

export default function AdultSiteBlocklistInfo() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <Shield className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Adult Site Blocklist Active
          </h3>
          <p className="text-sm text-red-800 mb-3">
            AgileWeb automatically blocks known adult content sites (Pornhub, XXX, OnlyFans, etc.) 
            for all age groups. This blocklist includes over 100 known adult sites and is checked 
            before all other filtering rules.
          </p>
          <div className="bg-white rounded p-3 border border-red-200">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">
                <strong>Note:</strong> The adult site blocklist takes highest priority and cannot 
                be overridden by custom controls or site policies. This ensures maximum protection 
                for all children.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

