'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, FolderTree, X, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { ICategory } from '@/types';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addImage, setAddImage] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async () => {
    if (!addName.trim()) return;
    setAdding(true);
    setMessage(null);
    try {
      await api.post('/categories', {
        name: addName.trim(),
        description: addDescription.trim(),
        image: addImage.trim(),
      });
      setAddName('');
      setAddDescription('');
      setAddImage('');
      setShowAddForm(false);
      setMessage({ type: 'success', text: 'Category created successfully!' });
      fetchCategories();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create category.' });
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (cat: ICategory) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description || '');
    setEditImage(cat.image || '');
  };

  const handleEdit = async () => {
    if (!editId || !editName.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.patch(`/categories/${editId}`, {
        name: editName.trim(),
        description: editDescription.trim(),
        image: editImage.trim(),
      });
      setEditId(null);
      setMessage({ type: 'success', text: 'Category updated successfully!' });
      fetchCategories();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setMessage(null);
    try {
      await api.delete(`/categories/${id}`);
      setShowDeleteModal(null);
      setMessage({ type: 'success', text: 'Category deleted successfully!' });
      fetchCategories();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete category.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Categories</h1>
          <p className="mt-1 text-sm text-text-secondary">Add, edit, and manage product categories.</p>
        </div>
        <Button size="sm" onClick={() => { setShowAddForm(true); setMessage(null); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {message && (
        <div className={`mt-4 border p-3 text-sm ${message.type === 'success' ? 'border-success bg-success/5 text-success' : 'border-error bg-error/5 text-error'}`}>
          {message.text}
        </div>
      )}

      {/* Add Category Form */}
      {showAddForm && (
        <div className="mt-6 border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Category name" />
            <Input label="Description" value={addDescription} onChange={(e) => setAddDescription(e.target.value)} placeholder="Short description" />
            <Input label="Image URL" value={addImage} onChange={(e) => setAddImage(e.target.value)} placeholder="https://..." />
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={handleAdd} loading={adding} disabled={!addName.trim()}>Create</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-4 flex gap-4 items-center">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="mt-6 border border-border p-12 text-center">
          <FolderTree className="h-12 w-12 text-text-secondary/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">No categories yet</h2>
          <p className="mt-1 text-sm text-text-secondary">Add your first category to organize products.</p>
        </div>
      ) : (
        <div className="mt-6 border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-card">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Image</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Products</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b border-border last:border-b-0 hover:bg-bg-card/50">
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 border border-border bg-bg-card flex items-center justify-center">
                      <span className="text-sm font-bold text-text-secondary/10">{cat.name.charAt(0)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editId === cat._id ? (
                      <div className="space-y-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-9 w-full border border-border bg-bg px-2 text-sm text-text-primary focus:border-primary-accent focus:outline-none"
                        />
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description"
                          className="h-9 w-full border border-border bg-bg px-2 text-sm text-text-primary focus:border-primary-accent focus:outline-none"
                        />
                        <input
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          placeholder="Image URL"
                          className="h-9 w-full border border-border bg-bg px-2 text-sm text-text-primary focus:border-primary-accent focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-text-primary">{cat.name}</p>
                        {cat.description && <p className="text-xs text-text-secondary mt-0.5">{cat.description}</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{cat.slug}</td>
                  <td className="px-4 py-3 text-text-primary font-medium">{cat.productCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editId === cat._id ? (
                        <>
                          <button
                            onClick={handleEdit}
                            disabled={saving}
                            className="h-8 w-8 flex items-center justify-center text-success hover:opacity-80 cursor-pointer disabled:opacity-50"
                            title="Save"
                          >
                            {saving ? <Skeleton className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
                            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-primary-accent cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal({ id: cat._id, name: cat.name })}
                            className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-error cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowDeleteModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-bg border border-border w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Delete Category</h3>
                <button onClick={() => setShowDeleteModal(null)} className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-2">Are you sure you want to delete this category?</p>
              <p className="text-sm font-medium text-text-primary mb-1">&quot;{showDeleteModal.name}&quot;</p>
              <p className="text-xs text-text-secondary mb-6">Categories with products cannot be deleted.</p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(null)}>Cancel</Button>
                <Button variant="danger" size="sm" loading={deletingId === showDeleteModal.id} onClick={() => handleDelete(showDeleteModal.id)}>Delete</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
