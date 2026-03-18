'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Pencil, Package, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import api from '@/lib/api';
import { IProduct, ICategory, PaginationMeta } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export default function ManageProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; title: string } | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (categoryFilter) params.set('category', categoryFilter);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data || []);
      setMeta(data.meta || null);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data || []);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter]);

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    try {
      await api.delete(`/products/${productId}`);
      setShowDeleteModal(null);
      fetchProducts();
    } catch {
      // error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Products</h1>
          <p className="mt-1 text-sm text-text-secondary">Add, edit, and manage your products.</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full border border-border bg-bg pl-10 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 border border-border bg-bg px-3 text-sm text-text-primary focus:border-primary-accent focus:outline-none min-w-[160px]"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-border p-4 flex gap-4 items-center">
              <Skeleton className="h-10 w-10 shrink-0" />
              <Skeleton className="h-4 w-48 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 border border-border p-12 text-center">
          <Package className="h-12 w-12 text-text-secondary/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">No products found</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {search || categoryFilter ? 'Try adjusting your filters.' : 'Add your first product to get started.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-card">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Product</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Category</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Price</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const category = typeof product.category === 'object' ? (product.category as ICategory) : null;
                return (
                  <tr key={product._id} className="border-b border-border last:border-b-0 hover:bg-bg-card/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 border border-border bg-bg-card flex items-center justify-center">
                          <span className="text-sm font-bold text-text-secondary/10">{product.title.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">{product.title}</p>
                          {product.isFeatured && (
                            <Badge variant="secondary" className="mt-0.5">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{category?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-text-primary font-medium">{formatPrice(product.discountPrice > 0 ? product.discountPrice : product.price)}</span>
                      {product.discountPrice > 0 && (
                        <span className="text-xs text-text-secondary line-through ml-1">{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.stock > 0 ? 'success' : 'error'}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.isActive ? 'success' : 'error'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/products/new?edit=${product._id}`}
                          className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-primary-accent transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal({ id: product._id, title: product.title })}
                          className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-error transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowDeleteModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-bg border border-border w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Delete Product</h3>
                <button onClick={() => setShowDeleteModal(null)} className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-2">
                Are you sure you want to delete this product?
              </p>
              <p className="text-sm font-medium text-text-primary mb-6">&quot;{showDeleteModal.title}&quot;</p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(null)}>Cancel</Button>
                <Button variant="danger" size="sm" loading={deletingId === showDeleteModal.id} onClick={() => handleDelete(showDeleteModal.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
