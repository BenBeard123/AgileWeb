'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { AgeGroup, AGE_GROUP_LABELS, GateMode } from '@/types';
import { Plus, Trash2, Edit2, Bell, BellOff } from 'lucide-react';

export default function ChildProfileManager() {
  const { children, addChild, updateChild, deleteChild } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ageGroup: 'UNDER_10' as AgeGroup,
    notificationEnabled: true,
    defaultGateMode: 'warning' as GateMode,
    categoryOverrides: [],
    customControls: [],
  });

  const ageGroups: AgeGroup[] = ['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'];
  const gateModes: { value: GateMode; label: string }[] = [
    { value: 'warning', label: 'Warning + Continue' },
    { value: 'delay', label: 'Delay (10-30s) + Continue' },
    { value: 'parent_approval', label: 'Parent Approval Required' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.trim().length === 0) {
      alert('Please enter a child name');
      return;
    }

    if (formData.name.trim().length > 100) {
      alert('Name must be 100 characters or less');
      return;
    }

    try {
      if (editingId) {
        updateChild(editingId, formData);
        setEditingId(null);
      } else {
        addChild(formData);
      }
      setFormData({ 
        name: '', 
        ageGroup: 'UNDER_10', 
        notificationEnabled: true,
        defaultGateMode: 'warning',
        categoryOverrides: [],
        customControls: [],
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving child:', error);
      alert('Failed to save child. Please try again.');
    }
  };

  const handleEdit = (child: typeof children[0]) => {
    setFormData({
      name: child.name,
      ageGroup: child.ageGroup,
      notificationEnabled: child.notificationEnabled,
      defaultGateMode: child.defaultGateMode || 'warning',
      categoryOverrides: Array.isArray(child.categoryOverrides) ? child.categoryOverrides : [],
      customControls: Array.isArray(child.customControls) ? child.customControls : [],
    });
    setEditingId(child.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ 
      name: '', 
      ageGroup: 'UNDER_10', 
      notificationEnabled: true,
      defaultGateMode: 'warning',
      categoryOverrides: [],
      customControls: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Child Profiles</h2>
          <p className="text-gray-600">Manage your children's profiles and age groups</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Child</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Child Profile' : 'Add New Child'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {ageGroups.map((age) => (
                  <option key={age} value={age}>
                    {AGE_GROUP_LABELS[age]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Gate Mode
              </label>
              <select
                value={formData.defaultGateMode}
                onChange={(e) => setFormData({ ...formData, defaultGateMode: e.target.value as GateMode })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {gateModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifications"
                checked={formData.notificationEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, notificationEnabled: e.target.checked })
                }
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                Enable notifications for blocked attempts
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Child
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(children) ? children : []).map((child) => {
          if (!child || !child.id) return null;
          return (
          <div key={child.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Age Group: {AGE_GROUP_LABELS[child.ageGroup]}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(child)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteChild(child.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Custom Controls</span>
                <span className="text-sm font-medium text-gray-900">
                  {child.customControls.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notifications</span>
                <button
                  onClick={() =>
                    updateChild(child.id, {
                      notificationEnabled: !child.notificationEnabled,
                    })
                  }
                  className="flex items-center space-x-1 text-sm"
                >
                  {child.notificationEnabled ? (
                    <>
                      <Bell className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">ON</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">OFF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {children.length === 0 && !isAdding && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Added</h3>
          <p className="text-gray-600 mb-6">
            Add your first child profile to start configuring age-appropriate content filtering.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Your First Child
          </button>
        </div>
      )}
    </div>
  );
}

