'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Users, X, Shield, Ban, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';
import { IUser, PaginationMeta } from '@/types';
import { formatDate } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Action states
  const [actionModal, setActionModal] = useState<{
    type: 'role' | 'block' | 'delete';
    user: IUser;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (debouncedSearch) params.set('search', debouncedSearch);

      const { data } = await api.get(`/users?${params.toString()}`);
      setUsers(data.data || []);
      setMeta(data.meta || null);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    setMessage(null);

    try {
      if (actionModal.type === 'role') {
        const newRole = actionModal.user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        await api.patch(`/users/${actionModal.user._id}`, { role: newRole });
        setMessage({ type: 'success', text: `Role changed to ${newRole}.` });
      } else if (actionModal.type === 'block') {
        const blocked = !actionModal.user.isBlocked;
        await api.patch(`/users/${actionModal.user._id}`, { isBlocked: blocked });
        setMessage({ type: 'success', text: blocked ? 'User blocked.' : 'User unblocked.' });
      } else if (actionModal.type === 'delete') {
        await api.delete(`/users/${actionModal.user._id}`);
        setMessage({ type: 'success', text: 'User deleted.' });
      }
      setActionModal(null);
      fetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const getActionTitle = () => {
    if (!actionModal) return '';
    if (actionModal.type === 'role') {
      return actionModal.user.role === 'ADMIN' ? 'Change to USER' : 'Change to ADMIN';
    }
    if (actionModal.type === 'block') {
      return actionModal.user.isBlocked ? 'Unblock User' : 'Block User';
    }
    return 'Delete User';
  };

  const getActionDescription = () => {
    if (!actionModal) return '';
    if (actionModal.type === 'role') {
      const newRole = actionModal.user.role === 'ADMIN' ? 'USER' : 'ADMIN';
      return `Change ${actionModal.user.name}'s role to ${newRole}?`;
    }
    if (actionModal.type === 'block') {
      return actionModal.user.isBlocked
        ? `Unblock ${actionModal.user.name}? They will be able to log in again.`
        : `Block ${actionModal.user.name}? They will not be able to log in.`;
    }
    return `Permanently delete ${actionModal.user.name}? This cannot be undone.`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">Manage Users</h1>
      <p className="mt-1 text-sm text-text-secondary">View and manage user accounts.</p>

      {message && (
        <div className={`mt-4 border p-3 text-sm ${message.type === 'success' ? 'border-success bg-success/5 text-success' : 'border-error bg-error/5 text-error'}`}>
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-11 w-full border border-border bg-bg pl-10 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-border p-4 flex gap-4 items-center">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6 border border-border p-12 text-center">
          <Users className="h-12 w-12 text-text-secondary/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">No users found</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {search ? 'Try a different search term.' : 'No users registered yet.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-card">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">User</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Email</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Role</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                return (
                  <tr key={u._id} className="border-b border-border last:border-b-0 hover:bg-bg-card/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 flex items-center justify-center bg-primary-accent text-white text-xs font-bold rounded-full">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-text-primary">
                          {u.name}
                          {isSelf && <span className="text-xs text-text-secondary ml-1">(you)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === 'ADMIN' ? 'secondary' : 'default'}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isBlocked ? 'error' : 'success'}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="text-xs text-text-secondary">—</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActionModal({ type: 'role', user: u })}
                            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-primary-accent cursor-pointer"
                            title={u.role === 'ADMIN' ? 'Make USER' : 'Make ADMIN'}
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'block', user: u })}
                            className={`h-8 w-8 flex items-center justify-center cursor-pointer ${u.isBlocked ? 'text-success hover:opacity-80' : 'text-text-secondary hover:text-warning'}`}
                            title={u.isBlocked ? 'Unblock' : 'Block'}
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'delete', user: u })}
                            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-error cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setActionModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-bg border border-border w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">{getActionTitle()}</h3>
                <button onClick={() => setActionModal(null)} className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-6">{getActionDescription()}</p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setActionModal(null)}>Cancel</Button>
                <Button
                  variant={actionModal.type === 'delete' || (actionModal.type === 'block' && !actionModal.user.isBlocked) ? 'danger' : 'primary'}
                  size="sm"
                  loading={actionLoading}
                  onClick={handleAction}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
