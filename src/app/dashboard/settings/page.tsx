'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">Manage your preferences and security.</p>

      <div className="mt-6 max-w-2xl space-y-6">
        {/* Theme Preference */}
        <div className="border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Appearance</h2>
          <p className="text-sm text-text-secondary mb-4">Choose your preferred theme.</p>

          {mounted && (
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-3 border cursor-pointer transition-colors ${
                  theme === 'light'
                    ? 'border-primary-accent bg-primary-accent/5 text-primary-accent'
                    : 'border-border text-text-secondary hover:border-text-secondary'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-3 border cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'border-primary-accent bg-primary-accent/5 text-primary-accent'
                    : 'border-border text-text-secondary hover:border-text-secondary'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span className="text-sm font-medium">Dark</span>
              </button>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>
          </div>

          {passwordMessage && (
            <div
              className={`mb-4 border p-3 text-sm ${
                passwordMessage.type === 'success'
                  ? 'border-success bg-success/5 text-success'
                  : 'border-error bg-error/5 text-error'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <Button onClick={handleChangePassword} loading={changingPassword} size="sm">
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
