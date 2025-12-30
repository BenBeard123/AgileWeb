'use client';

import { useStore } from '@/store/useStore';
import { AGE_GROUP_LABELS } from '@/types';
import { Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import AdultSiteBlocklistInfo from './AdultSiteBlocklistInfo';

export default function Dashboard() {
  const { children, blockedAttempts } = useStore();
  
  // Safety checks
  const safeBlockedAttempts = Array.isArray(blockedAttempts) ? blockedAttempts : [];
  const safeChildren = Array.isArray(children) ? children : [];
  
  const recentAttempts = safeBlockedAttempts.slice(0, 5);
  const todayAttempts = safeBlockedAttempts.filter((attempt) => {
    if (!attempt || !attempt.timestamp) return false;
    try {
      return new Date(attempt.timestamp).toDateString() === new Date().toDateString();
    } catch {
      return false;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your child safety settings and activity</p>
      </div>

      <AdultSiteBlocklistInfo />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Children</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{children.length}</p>
            </div>
            <Users className="h-12 w-12 text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked Today</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{todayAttempts.length}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Attempts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{blockedAttempts.length}</p>
            </div>
            <Shield className="h-12 w-12 text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Profiles</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {children.filter((c) => c.notificationEnabled).length}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Children</h3>
          <div className="space-y-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{child.name}</p>
                  <p className="text-sm text-gray-600">Age Group: {AGE_GROUP_LABELS[child.ageGroup]}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {child.customControls.length} custom controls
                  </p>
                  <p className="text-xs text-gray-500">
                    {child.notificationEnabled ? 'Notifications ON' : 'Notifications OFF'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentAttempts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Blocked Attempts</h3>
          <div className="space-y-2">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{attempt.url}</p>
                  <p className="text-sm text-gray-600">
                    {attempt.category} • {attempt.contentType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">{attempt.action}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(attempt.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {children.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Added Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding a child profile to configure age-appropriate content filtering.
          </p>
        </div>
      )}
    </div>
  );
}

