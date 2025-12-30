'use client';

import { useState } from 'react';
import { contentCategories } from '@/data/contentCategories';
import { AgeGroup, AccessAction, AGE_GROUP_LABELS } from '@/types';
import { ChevronDown, ChevronUp, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const actionColors: Record<AccessAction, string> = {
  BLOCK: 'bg-red-100 text-red-800 border-red-300',
  GATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ALLOW: 'bg-green-100 text-green-800 border-green-300',
};

const actionIcons: Record<AccessAction, typeof Shield> = {
  BLOCK: Shield,
  GATE: AlertTriangle,
  ALLOW: CheckCircle,
};

export default function ContentCategoryView() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const ageGroups: AgeGroup[] = ['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Content Categories</h2>
        <p className="text-gray-600">
          Configure age-appropriate access rules for different types of content
        </p>
      </div>

      <div className="space-y-4">
        {contentCategories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const Icon = isExpanded ? ChevronUp : ChevronDown;

          return (
            <div key={category.id} className="bg-white rounded-lg shadow">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
                <Icon className="h-5 w-5 text-gray-400" />
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Content Type
                          </th>
                          {ageGroups.map((age) => (
                            <th
                              key={age}
                              className="text-center py-3 px-4 font-semibold text-gray-900"
                            >
                              {AGE_GROUP_LABELS[age]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {category.contentTypes.map((contentType, idx) => (
                          <tr
                            key={contentType.id}
                            className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {contentType.name}
                            </td>
                            {ageGroups.map((age) => {
                              const action = contentType.rules[age];
                              const ActionIcon = actionIcons[action];
                              return (
                                <td key={age} className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${actionColors[action]}`}
                                  >
                                    <ActionIcon className="h-4 w-4" />
                                    <span>{action}</span>
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Access Actions Explained</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">BLOCK:</span> Content is not accessible. The page
              will be blocked and the parent will be notified (if enabled).
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">GATE:</span> Content is allowed with friction:
              warning + continue, delay (10-30s) + continue, or parent approval required.
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">ALLOW:</span> Unrestricted access to the content.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

