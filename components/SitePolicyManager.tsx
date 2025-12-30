'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { SitePolicy, AgeGroup, AccessAction, GateMode, AGE_GROUP_LABELS } from '@/types';
import { Plus, Trash2, Edit2, Globe, Smartphone, Link } from 'lucide-react';
import { validateSitePolicy } from '@/utils/sitePolicyManager';

export default function SitePolicyManager() {
  const { sitePolicies, addSitePolicy, updateSitePolicy, removeSitePolicy, children } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SitePolicy>>({
    sitePattern: '',
    type: 'domain',
    ageGroup: 'UNDER_10',
    action: 'BLOCK',
    gateMode: 'warning',
    childId: undefined,
  });

  const ageGroups: AgeGroup[] = ['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'];
  const gateModes: { value: GateMode; label: string }[] = [
    { value: 'warning', label: 'Warning + Continue' },
    { value: 'delay', label: 'Delay (10-30s) + Continue' },
    { value: 'parent_approval', label: 'Parent Approval Required' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSitePolicy(formData);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      if (editingId) {
        updateSitePolicy(editingId, formData);
        setEditingId(null);
      } else {
        addSitePolicy(formData as Omit<SitePolicy, 'id'>);
      }
      setFormData({
        sitePattern: '',
        type: 'domain',
        ageGroup: 'UNDER_10',
        action: 'BLOCK',
        gateMode: 'warning',
        childId: undefined,
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving site policy:', error);
      alert('Failed to save site policy. Please try again.');
    }
  };

  const handleEdit = (policy: SitePolicy) => {
    setFormData({
      sitePattern: policy.sitePattern,
      type: policy.type,
      ageGroup: policy.ageGroup,
      action: policy.action,
      gateMode: policy.gateMode || 'warning',
      childId: policy.childId,
      notes: policy.notes,
    });
    setEditingId(policy.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      sitePattern: '',
      type: 'domain',
      ageGroup: 'UNDER_10',
      action: 'BLOCK',
      gateMode: 'warning',
      childId: undefined,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'domain':
        return Globe;
      case 'app':
        return Smartphone;
      default:
        return Link;
    }
  };

  const getChildName = (childId?: string) => {
    if (!childId) return 'All Children';
    const child = children.find((c) => c.id === childId);
    return child?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Site & App Policies (V2)</h2>
          <p className="text-gray-600">
            Set specific policies for individual websites, domains, or apps
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Policy</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Site Policy' : 'Add New Site Policy'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Pattern (URL, domain, or app identifier)
              </label>
              <input
                type="text"
                value={formData.sitePattern || ''}
                onChange={(e) => setFormData({ ...formData, sitePattern: e.target.value })}
                placeholder="e.g., youtube.com, tiktok.com, or https://example.com/page"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'url' | 'app' | 'domain' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="domain">Domain (e.g., youtube.com)</option>
                <option value="url">URL Pattern (e.g., /shorts, /reel)</option>
                <option value="app">App Identifier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
              <select
                value={formData.childId || ''}
                onChange={(e) => setFormData({ ...formData, childId: e.target.value || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Children</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({AGE_GROUP_LABELS[child.ageGroup]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value as AccessAction })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="BLOCK">Block</option>
                <option value="GATE">Gate</option>
                <option value="ALLOW">Allow</option>
              </select>
            </div>

            {formData.action === 'GATE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gate Mode</label>
                <select
                  value={formData.gateMode || 'warning'}
                  onChange={(e) => setFormData({ ...formData, gateMode: e.target.value as GateMode })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {gateModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this policy..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {editingId ? 'Update' : 'Add'} Policy
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

      <div className="space-y-4">
        {sitePolicies.length > 0 ? (
          sitePolicies.map((policy) => {
            const Icon = getTypeIcon(policy.type);
            return (
              <div key={policy.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon className="h-5 w-5 text-primary-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{policy.sitePattern}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {policy.type}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Age Group:</strong> {AGE_GROUP_LABELS[policy.ageGroup]}
                        </p>
                        <p>
                          <strong>Action:</strong>{' '}
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              policy.action === 'BLOCK'
                                ? 'bg-red-100 text-red-800'
                                : policy.action === 'GATE'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {policy.action}
                          </span>
                          {policy.action === 'GATE' && policy.gateMode && (
                            <span className="ml-2 text-gray-500">({policy.gateMode})</span>
                          )}
                        </p>
                        <p>
                          <strong>Applies To:</strong> {getChildName(policy.childId)}
                        </p>
                        {policy.notes && (
                          <p>
                            <strong>Notes:</strong> {policy.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(policy)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => removeSitePolicy(policy.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Site Policies</h3>
            <p className="text-gray-600 mb-6">
              Add site-specific policies to override default rules for particular websites or apps.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Your First Site Policy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

