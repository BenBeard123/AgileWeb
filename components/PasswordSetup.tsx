'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useChromeStore } from '@/store/useChromeStore';
import { PasswordManager } from '@/store/passwordManager';

export default function PasswordSetup() {
  const [hasPassword, setHasPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hint, setHint] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isExtension, setIsExtension] = useState(false);

  const passwordManager = PasswordManager.getInstance();

  useEffect(() => {
    const checkExtension = () => {
      const extension = typeof window !== 'undefined' && typeof chrome !== 'undefined' && chrome.storage !== undefined;
      setIsExtension(extension);
      
      if (extension) {
        passwordManager.hasPassword().then(setHasPassword);
      }
    };

    checkExtension();
  }, []);

  const handleSetPassword = async () => {
    setError('');
    setSuccess('');

    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await passwordManager.setPassword(password, hint || undefined);
      setSuccess('Parental control code set successfully!');
      setHasPassword(true);
      setPassword('');
      setConfirmPassword('');
      setHint('');
    } catch (error) {
      setError('Failed to set password. Please try again.');
      console.error('Error setting password:', error);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter current password');
      return;
    }

    const isValid = await passwordManager.verifyPassword(currentPassword);
    if (!isValid) {
      setError('Current password is incorrect');
      return;
    }

    if (password.length < 4) {
      setError('New password must be at least 4 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await passwordManager.setPassword(password, hint || undefined);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setHint('');
    } catch (error) {
      setError('Failed to change password. Please try again.');
      console.error('Error changing password:', error);
    }
  };

  const handleRemovePassword = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter current password to remove protection');
      return;
    }

    const isValid = await passwordManager.verifyPassword(currentPassword);
    if (!isValid) {
      setError('Password is incorrect');
      return;
    }

    try {
      await passwordManager.clearPassword();
      setSuccess('Password protection removed');
      setHasPassword(false);
      setCurrentPassword('');
    } catch (error) {
      setError('Failed to remove password. Please try again.');
      console.error('Error removing password:', error);
    }
  };

  if (!isExtension) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Parental Control Code</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Parental control code protection is only available when using the Chrome extension.
          Install the extension to enable this feature.
        </p>
        <a
          href="/extension/INSTALL.md"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Learn how to install the extension
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Lock className="h-6 w-6 text-primary-600" />
        <h3 className="text-xl font-semibold text-gray-900">Parental Control Code</h3>
      </div>

      <p className="text-gray-600 mb-6">
        Set a code to prevent children from disabling or uninstalling the extension.
        This code will be required to access extension settings.
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {!hasPassword ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Parental Control Code
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter code (min 4 characters)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Code
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hint (Optional)
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Optional hint to help you remember"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSetPassword}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Set Parental Control Code
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm font-medium">
              ✓ Parental control code is active
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Code (to change or remove)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Code (optional - leave blank to keep current)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Code
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hint (Optional)
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Optional hint"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3">
            {password && (
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Change Code
              </button>
            )}
            <button
              onClick={handleRemovePassword}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove Protection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

