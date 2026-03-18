'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Star, Trash2, MessageSquare, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import api from '@/lib/api';
import { IReview, IProduct, PaginationMeta } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews/my?page=${page}&limit=10`);
      setReviews(data.data || []);
      setMeta(data.meta || null);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      setShowDeleteModal(null);
      fetchReviews();
    } catch {
      // error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary">My Reviews</h1>
      <p className="mt-1 text-sm text-text-secondary">Manage your product reviews.</p>

      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-4 flex gap-4">
              <Skeleton className="h-16 w-16 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-6 border border-border p-12 text-center">
          <MessageSquare className="h-12 w-12 text-text-secondary/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary">No reviews yet</h2>
          <p className="mt-1 text-sm text-text-secondary">
            You haven&apos;t reviewed any products yet.
          </p>
          <Link href="/products" className="text-sm text-primary-accent hover:underline mt-2 inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => {
            const product = review.productId as unknown as IProduct;
            const productTitle = typeof review.productId === 'object' ? product.title : 'Product';
            const productSlug = typeof review.productId === 'object' ? product.slug : '';

            return (
              <div key={review._id} className="border border-border p-4 sm:p-5">
                <div className="flex gap-4">
                  {/* Product Image Placeholder */}
                  <Link href={productSlug ? `/products/${productSlug}` : '#'} className="shrink-0">
                    <div className="h-16 w-16 border border-border bg-bg-card flex items-center justify-center">
                      <span className="text-xl font-bold text-text-secondary/10">
                        {productTitle.charAt(0)}
                      </span>
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={productSlug ? `/products/${productSlug}` : '#'}
                          className="text-sm font-medium text-text-primary hover:text-primary-accent transition-colors"
                        >
                          {productTitle}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? 'fill-secondary text-secondary'
                                    : 'text-border'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-text-secondary">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowDeleteModal(review._id)}
                        className="text-text-secondary hover:text-error transition-colors cursor-pointer shrink-0"
                        title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-text-secondary">{review.comment}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-6">
              <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowDeleteModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-bg border border-border w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Delete Review</h3>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deletingId === showDeleteModal}
                  onClick={() => handleDelete(showDeleteModal)}
                >
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
