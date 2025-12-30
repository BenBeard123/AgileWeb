'use client';

import { useStore } from '@/store/useStore';
import { FileText, X, Shield, CheckCircle, Settings, Filter } from 'lucide-react';
import { AGE_GROUP_LABELS } from '@/types';

const typeIcons = {
  blocked_attempt: Shield,
  approval: CheckCircle,
  override: Settings,
  rule_change: FileText,
  custom_control: Filter,
};

const typeLabels = {
  blocked_attempt: 'Blocked Attempt',
  approval: 'Parent Approval',
  override: 'Category Override',
  rule_change: 'Rule Change',
  custom_control: 'Custom Control',
};

export default function AuditLogView() {
  const { auditLog, clearAuditLog, children } = useStore();

  const getChildName = (childId: string) => {
    if (!childId || typeof childId !== 'string') return 'Unknown';
    const child = children.find((c) => c && c.id === childId);
    return child?.name || 'Unknown';
  };

  const groupedByDate = auditLog.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof auditLog>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Audit Log</h2>
          <p className="text-gray-600">
            Complete history of blocked attempts, approvals, overrides, and rule changes
          </p>
        </div>
        {auditLog.length > 0 && (
          <button
            onClick={clearAuditLog}
            className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {auditLog.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, entries]) => {
              const Icon = typeIcons[entries[0]?.type] || FileText;
              return (
                <div key={date} className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <p className="text-sm text-gray-600">{entries.length} event(s)</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {entries
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                      )
                      .map((entry) => {
                        const EntryIcon = typeIcons[entry.type] || FileText;
                        return (
                          <div
                            key={entry.id}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <EntryIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900">
                                      {typeLabels[entry.type]}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      • {getChildName(entry.childId)}
                                    </span>
                                  </div>
                                  {entry.details.url && (
                                    <p className="text-sm text-gray-700 mb-1">
                                      <strong>URL:</strong> {entry.details.url}
                                    </p>
                                  )}
                                  {entry.details.category && (
                                    <p className="text-sm text-gray-700 mb-1">
                                      <strong>Category:</strong> {entry.details.category}
                                      {entry.details.contentType && (
                                        <span> • {entry.details.contentType}</span>
                                      )}
                                    </p>
                                  )}
                                  {entry.details.action && (
                                    <p className="text-sm text-gray-700 mb-1">
                                      <strong>Action:</strong>{' '}
                                      <span
                                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          entry.details.action === 'BLOCK'
                                            ? 'bg-red-100 text-red-800'
                                            : entry.details.action === 'GATE'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}
                                      >
                                        {entry.details.action}
                                      </span>
                                    </p>
                                  )}
                                  {entry.details.parentAction && (
                                    <p className="text-sm text-gray-700 mb-1">
                                      <strong>Parent Action:</strong>{' '}
                                      {entry.details.parentAction
                                        .replace('_', ' ')
                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </p>
                                  )}
                                  {entry.details.ruleChange && (
                                    <p className="text-sm text-gray-700">{entry.details.ruleChange}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm text-gray-500 ml-4">
                                {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
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
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Audit Log Entries</h3>
          <p className="text-gray-600">
            Audit log entries will appear here as you use AgileWeb. This includes blocked attempts,
            parent approvals, category overrides, and rule changes.
          </p>
        </div>
      )}
    </div>
  );
}

