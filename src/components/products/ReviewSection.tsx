'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Star, Sparkles, Loader2, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { IReview, IUser } from '@/types';
import { formatDate } from '@/lib/utils';

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Write review state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // AI summary state
  const [summary, setSummary] = useState<{ summary: string; sentiment: string; reviewCount: number } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const autoSummaryFiredRef = useRef(false);

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews/product/${productId}?page=${p}&limit=5`);
      const fetched: IReview[] = data.data || [];
      setReviews(fetched);
      setTotalPages(data.meta?.totalPages || 1);
      setPage(p);
      // Auto-load AI summary once when 3+ reviews are present
      if (p === 1 && !autoSummaryFiredRef.current && (data.meta?.total ?? fetched.length) >= 3) {
        autoSummaryFiredRef.current = true;
        setSummaryLoading(true);
        api.post('/ai/review-summary', { productId })
          .then(({ data: d }) => setSummary(d.data))
          .catch(() => {})
          .finally(() => setSummaryLoading(false));
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const hasReviewed = reviews.some((r) => {
    const reviewUser = r.userId as IUser;
    return reviewUser?._id === user?._id;
  });

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (rating === 0) { setReviewError('Please select a rating'); return; }
    if (comment.trim().length < 5) { setReviewError('Comment must be at least 5 characters'); return; }

    setSubmitting(true);
    try {
      await api.post('/reviews', { productId, rating, comment: comment.trim() });
      setRating(0);
      setComment('');
      fetchReviews(1);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setReviewError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews(page);
    } catch {
      // silently fail
    }
  };

  const handleAISummary = async () => {
    setSummaryLoading(true);
    try {
      const { data } = await api.post('/ai/review-summary', { productId });
      setSummary(data.data);
    } catch {
      setSummary({ summary: 'Could not generate summary at this time.', sentiment: 'neutral', reviewCount: 0 });
    } finally {
      setSummaryLoading(false);
    }
  };

  const sentimentColor: Record<string, string> = {
    positive: 'success',
    negative: 'error',
    mixed: 'warning',
    neutral: 'default',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Reviews {!loading && `(${reviews.length})`}
        </h2>

        {/* AI Summary Button — only shown when auto-summary didn't fire */}
        {!summary && !summaryLoading && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAISummary}
            loading={summaryLoading}
            disabled={summaryLoading}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            AI Summary
          </Button>
        )}
        {summaryLoading && (
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating summary…
          </span>
        )}
      </div>

      {/* AI Summary Result */}
      {summary && (
        <div className="border border-border bg-bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary-accent" />
            <span className="text-sm font-semibold text-text-primary">AI Review Summary</span>
            <Badge variant={(sentimentColor[summary.sentiment] || 'default') as 'success' | 'error' | 'warning' | 'default'}>
              {summary.sentiment}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{summary.summary}</p>
        </div>
      )}

      {/* Write Review Form */}
      {user && !hasReviewed && (
        <form onSubmit={handleSubmitReview} className="border border-border bg-bg-card p-4 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Write a Review</h3>

          {reviewError && (
            <p className="text-xs text-error">{reviewError}</p>
          )}

          {/* Star Selector */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="cursor-pointer"
                aria-label={`Rate ${s} stars`}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    s <= (hoverRating || rating)
                      ? 'fill-secondary text-secondary'
                      : 'text-border'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && <span className="ml-2 text-sm text-text-secondary">{rating}/5</span>}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={3}
            className="w-full border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none resize-none"
          />

          <Button type="submit" size="sm" loading={submitting}>
            Submit Review
          </Button>
        </form>
      )}

      {!user && (
        <p className="text-sm text-text-secondary border border-border bg-bg-card p-4">
          Please <a href="/login" className="text-primary-accent hover:underline">login</a> to write a review.
        </p>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border bg-bg-card p-4 animate-pulse">
              <div className="h-4 w-32 bg-bg-sidebar mb-3" />
              <div className="h-3 w-full bg-bg-sidebar mb-2" />
              <div className="h-3 w-2/3 bg-bg-sidebar" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-8">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const reviewUser = review.userId as IUser;
            const isOwn = reviewUser?._id === user?._id;
            const isAdmin = user?.role === 'ADMIN';

            return (
              <div key={review._id} className="border border-border bg-bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center bg-primary-accent/10 text-primary-accent text-xs font-bold rounded-full shrink-0">
                      {reviewUser?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{reviewUser?.name || 'Anonymous'}</p>
                      <p className="text-xs text-text-secondary">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? 'fill-secondary text-secondary' : 'text-border'}`}
                        />
                      ))}
                    </div>
                    {(isOwn || isAdmin) && (
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="h-7 w-7 flex items-center justify-center text-text-secondary hover:text-error transition-colors cursor-pointer"
                        aria-label="Delete review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm text-text-secondary leading-relaxed">{review.comment}</p>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchReviews(i + 1)}
                  className={`h-8 w-8 flex items-center justify-center text-xs border transition-colors cursor-pointer ${
                    page === i + 1
                      ? 'border-primary-accent bg-primary-accent text-white'
                      : 'border-border text-text-secondary hover:bg-bg-card'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
