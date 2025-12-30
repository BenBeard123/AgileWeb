'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { CustomParentControl, AccessAction } from '@/types';
import { Plus, Trash2, Globe, Hash, Tag, Shield } from 'lucide-react';

const actionOptions: AccessAction[] = ['BLOCK', 'GATE', 'ALLOW'];

export default function CustomControlsPanel() {
  const { children, addCustomControl, removeCustomControl } = useStore();
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [controlType, setControlType] = useState<'interest' | 'url' | 'keyword'>('interest');
  const [controlValue, setControlValue] = useState('');
  const [controlAction, setControlAction] = useState<AccessAction>('BLOCK');

  const handleAddControl = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedChildId) {
      alert('Please select a child');
      return;
    }

    if (!controlValue || controlValue.trim().length === 0) {
      alert('Please enter a value');
      return;
    }

    if (controlValue.trim().length > 500) {
      alert('Value must be 500 characters or less');
      return;
    }

    if (controlType === 'url') {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      if (!urlPattern.test(controlValue.trim())) {
        alert('Please enter a valid URL');
        return;
      }
    }

    try {
      addCustomControl(selectedChildId, {
        type: controlType,
        value: controlValue.trim(),
        action: controlAction,
      });

      setControlValue('');
    } catch (error) {
      console.error('Error adding control:', error);
      alert('Failed to add control. Please try again.');
    }
  };

  const getControlIcon = (type: string) => {
    switch (type) {
      case 'url':
        return Globe;
      case 'keyword':
        return Hash;
      default:
        return Tag;
    }
  };

  const getControlLabel = (type: string) => {
    switch (type) {
      case 'url':
        return 'URL';
      case 'keyword':
        return 'Keyword';
      default:
        return 'Interest';
    }
  };

  const allControls = children.flatMap((child) =>
    child.customControls.map((control) => ({ ...control, childName: child.name }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Custom Parent Controls</h2>
        <p className="text-gray-600">
          Block specific interests, URLs, or keywords for individual children
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Custom Control</h3>
        <form onSubmit={handleAddControl} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Choose a child...</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.ageGroup})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Control Type</label>
            <select
              value={controlType}
              onChange={(e) =>
                setControlType(e.target.value as 'interest' | 'url' | 'keyword')
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="interest">Interest (e.g., Roblox, cars)</option>
              <option value="url">URL (specific website)</option>
              <option value="keyword">Keyword (single-meaning terms only)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getControlLabel(controlType)}
            </label>
            <input
              type="text"
              value={controlValue}
              onChange={(e) => setControlValue(e.target.value)}
              placeholder={
                controlType === 'url'
                  ? 'https://example.com'
                  : controlType === 'keyword'
                  ? 'Enter keyword (single meaning only)'
                  : 'e.g., Roblox, cars'
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            {controlType === 'keyword' && (
              <p className="mt-1 text-xs text-gray-500">
                ⚠️ Use only words with single meanings to avoid false positives
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={controlAction}
                onChange={(e) => setControlAction(e.target.value as AccessAction)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action === 'BLOCK' ? 'Block' : action === 'GATE' ? 'Gate (with warning/approval)' : 'Allow (override default rules)'}
                  </option>
                ))}
              </select>
          </div>

          <button
            type="submit"
            disabled={!selectedChildId || !controlValue.trim()}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Control</span>
          </button>
        </form>
      </div>

      {allControls.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Custom Controls</h3>
          <div className="space-y-3">
            {allControls.map((control) => {
              const Icon = getControlIcon(control.type);
              const child = children.find((c) => c.id === control.childId);
              return (
                <div
                  key={control.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{control.value}</p>
                      <p className="text-sm text-gray-600">
                        {getControlLabel(control.type)} • {child?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        control.action === 'BLOCK'
                          ? 'bg-red-100 text-red-800'
                          : control.action === 'GATE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {control.action}
                    </span>
                    <button
                      onClick={() =>
                        control.childId &&
                        removeCustomControl(control.childId, control.id)
                      }
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Custom Controls</h3>
          <p className="text-gray-600">
            Add custom controls to block specific interests, URLs, or keywords for your children.
          </p>
        </div>
      )}

      {children.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> You need to add at least one child profile before creating custom
            controls.
          </p>
        </div>
      )}
    </div>
  );
}

