'use client';

import { useStore } from '@/store/useStore';
import { Shield, AlertTriangle, X } from 'lucide-react';

export default function BlockedAttemptsView() {
  const { blockedAttempts, clearBlockedAttempts, children } = useStore();

  const getChildName = (childId: string) => {
    if (!childId || typeof childId !== 'string') return 'Unknown';
    const child = children.find((c) => c && c.id === childId);
    return child?.name || 'Unknown';
  };

  const actionColors = {
    BLOCK: 'bg-red-100 text-red-800 border-red-300',
    GATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ALLOW: 'bg-green-100 text-green-800 border-green-300',
  };

  // Safety checks
  const safeBlockedAttempts = Array.isArray(blockedAttempts) ? blockedAttempts : [];

  const groupedByDate = safeBlockedAttempts.reduce((acc, attempt) => {
    if (!attempt || !attempt.timestamp) return acc;
    try {
      const date = new Date(attempt.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(attempt);
    } catch (error) {
      console.error('Error processing blocked attempt:', error);
    }
    return acc;
  }, {} as Record<string, typeof safeBlockedAttempts>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Blocked Access Attempts</h2>
          <p className="text-gray-600">
            View all blocked, gated, or flagged content access attempts
          </p>
        </div>
        {safeBlockedAttempts.length > 0 && (
          <button
            onClick={clearBlockedAttempts}
            className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {safeBlockedAttempts.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => {
              try {
                return new Date(b).getTime() - new Date(a).getTime();
              } catch {
                return 0;
              }
            })
            .map(([date, attempts]) => {
              if (!attempts || attempts.length === 0) return null;
              return (
              <div key={date} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {(() => {
                      try {
                        return new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        });
                      } catch {
                        return date;
                      }
                    })()}
                  </h3>
                  <p className="text-sm text-gray-600">{attempts.length} attempt(s)</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {attempts
                    .sort((a, b) => {
                      if (!a || !b || !a.timestamp || !b.timestamp) return 0;
                      try {
                        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                      } catch {
                        return 0;
                      }
                    })
                    .filter(attempt => attempt !== null)
                    .map((attempt) => {
                      if (!attempt) return null;
                      return (
                      <div key={attempt.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {attempt.action === 'BLOCK' ? (
                                <Shield className="h-5 w-5 text-red-600" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                              )}
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium border ${actionColors[attempt.action]}`}
                              >
                                {attempt.action}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900 mb-1">{attempt.url}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>
                                <strong>Category:</strong> {attempt.category}
                              </span>
                              <span>
                                <strong>Type:</strong> {attempt.contentType}
                              </span>
                              <span>
                                <strong>Child:</strong> {getChildName(attempt.childId)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500 ml-4">
                            {(() => {
                              try {
                                return new Date(attempt.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                });
                              } catch {
                                return '';
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                    })}
                </div>
              </div>
            );
            })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blocked Attempts</h3>
          <p className="text-gray-600">
            When content is blocked or gated based on your rules, attempts will appear here. Parent
            notifications will also be sent if enabled.
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About Notifications</h3>
        <p className="text-sm text-blue-800">
          When a child attempts to access blocked content, parents will receive a notification if
          notifications are enabled for that child's profile. You can enable or disable
          notifications in the Children tab.
        </p>
      </div>
    </div>
  );
}

