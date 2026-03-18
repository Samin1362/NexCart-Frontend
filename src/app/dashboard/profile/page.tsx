'use client';

import { useState } from 'react';
import { Pencil, X, Check, User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';
import { IUser } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
  });

  const handleEdit = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    });
    setEditing(true);
    setMessage(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.patch('/users/me', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        avatar: form.avatar.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.zipCode.trim(),
          country: form.country.trim(),
        },
      });
      updateUser(data.data as IUser);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your account information.</p>
        </div>
        {!editing && (
          <Button variant="secondary" size="sm" onClick={handleEdit}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit Profile
          </Button>
        )}
      </div>

      {message && (
        <div
          className={`mt-4 border p-3 text-sm ${
            message.type === 'success'
              ? 'border-success bg-success/5 text-success'
              : 'border-error bg-error/5 text-error'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 max-w-2xl">
        <div className="border border-border p-6">
          {/* Avatar + Basic Info Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 flex items-center justify-center bg-primary-accent text-white text-2xl font-bold rounded-full shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{user.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={user.role === 'ADMIN' ? 'secondary' : 'default'}>{user.role}</Badge>
                <span className="text-xs text-text-secondary">Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {editing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Your name"
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="Your phone number"
              />
              <Input
                label="Avatar URL"
                value={form.avatar}
                onChange={(e) => updateField('avatar', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />

              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h3>
                <div className="space-y-3">
                  <Input
                    label="Street"
                    value={form.street}
                    onChange={(e) => updateField('street', e.target.value)}
                    placeholder="123 Main Street"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="City"
                    />
                    <Input
                      label="State"
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Zip Code"
                      value={form.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      placeholder="10001"
                    />
                    <Input
                      label="Country"
                      value={form.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} loading={saving}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Name</p>
                    <p className="text-sm text-text-primary">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Email</p>
                    <p className="text-sm text-text-primary">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Phone</p>
                    <p className="text-sm text-text-primary">{user.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-text-secondary">Role</p>
                    <p className="text-sm text-text-primary">{user.role}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-text-secondary" />
                  <h3 className="text-sm font-semibold text-text-primary">Address</h3>
                </div>
                {user.address?.street ? (
                  <div className="text-sm text-text-secondary space-y-0.5">
                    <p>{user.address.street}</p>
                    <p>
                      {user.address.city}
                      {user.address.state ? `, ${user.address.state}` : ''}
                      {user.address.zipCode ? ` ${user.address.zipCode}` : ''}
                    </p>
                    {user.address.country && <p>{user.address.country}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No address set</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
