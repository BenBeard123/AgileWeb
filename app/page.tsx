'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ChildProfileManager from '@/components/ChildProfileManager';
import ContentCategoryView from '@/components/ContentCategoryView';
import CustomControlsPanel from '@/components/CustomControlsPanel';
import BlockedAttemptsView from '@/components/BlockedAttemptsView';
import AuditLogView from '@/components/AuditLogView';
import SitePolicyManager from '@/components/SitePolicyManager';
import ExtensionStatus from '@/components/ExtensionStatus';
import { StoreProvider } from '@/components/StoreProvider';
import { Shield, Users, Settings, AlertTriangle, Filter, FileText, Globe } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'children' | 'categories' | 'controls' | 'attempts' | 'audit' | 'policies'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'categories', label: 'Content Categories', icon: Filter },
    { id: 'controls', label: 'Custom Controls', icon: Settings },
    { id: 'policies', label: 'Site Policies (V2)', icon: Globe },
    { id: 'attempts', label: 'Blocked Attempts', icon: AlertTriangle },
    { id: 'audit', label: 'Audit Log', icon: FileText },
  ];

  return (
    <StoreProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AgileWeb</h1>
                  <p className="text-sm text-gray-600">Age-Appropriate Access for your Growing Child</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExtensionStatus />
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'children' && <ChildProfileManager />}
          {activeTab === 'categories' && <ContentCategoryView />}
          {activeTab === 'controls' && <CustomControlsPanel />}
          {activeTab === 'policies' && <SitePolicyManager />}
          {activeTab === 'attempts' && <BlockedAttemptsView />}
          {activeTab === 'audit' && <AuditLogView />}
        </main>
      </div>
    </StoreProvider>
  );
}

