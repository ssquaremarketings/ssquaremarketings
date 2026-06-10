"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import clsx from "clsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={clsx(
            "w-4 h-4",
            i <= rating ? "text-yellow-400" : "text-gray-300"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.967c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState("all");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchReviews() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json();
      console.log("[AdminReviewsPage] API response payload:", payload);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load reviews");
      }

      const nextReviews = payload?.data?.reviews || [];
      console.log("[AdminReviewsPage] total reviews returned:", nextReviews.length);
      setReviews(nextReviews);
    } catch (fetchError: any) {
      console.error("[AdminReviewsPage] Supabase/API error:", fetchError);
      setError(fetchError?.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, []);

  async function handleApprove(id: string) {
    setActionLoading(id + "-approve");
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
    );
    await supabase.from("reviews").update({ approved: true }).eq("id", id);
    setActionLoading(null);
    fetchReviews();
  }

  async function handleFeature(id: string, featured: boolean) {
    setActionLoading(id + "-feature");
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, featured: !featured } : r))
    );
    await supabase.from("reviews").update({ featured: !featured }).eq("id", id);
    setActionLoading(null);
    fetchReviews();
  }

  async function handleDelete(id: string) {
    setActionLoading(id + "-delete");
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("reviews").delete().eq("id", id);
    setActionLoading(null);
    fetchReviews();
  }

  let filtered = reviews;
  if (tab === "pending") filtered = reviews.filter((r) => !r.approved);
  if (tab === "approved") filtered = reviews.filter((r) => r.approved);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Reviews</h1>
      <div className="flex gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.value}
            className={clsx(
              "px-4 py-2 rounded-full font-semibold",
              tab === t.value
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-10">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 text-center py-10">No reviews found</div>
      ) : (
        <div className="space-y-6">
          {filtered.map((review) => (
            <div
              key={review.id}
              className={clsx(
                "rounded-xl shadow p-6 bg-white flex flex-col gap-2 border",
                review.featured ? "border-yellow-400" : "border-gray-200"
              )}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="font-semibold text-lg">{review.reviewer_name}</span>
                <StarRating rating={review.rating} />
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(review.created_at).toLocaleString()}
                </span>
              </div>
              <div className="text-gray-700 mb-2">{review.review_text}</div>
              <div className="text-sm text-gray-500 mb-2">{review.property}</div>
              <div className="flex items-center gap-2 mb-2">
                {review.featured && (
                  <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Featured</span>
                )}
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded text-xs font-semibold",
                    review.approved
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {review.approved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {!review.approved && (
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={actionLoading === review.id + "-approve"}
                    className="px-4 py-1.5 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                  >
                    {actionLoading === review.id + "-approve" ? "Approving..." : "Approve"}
                  </button>
                )}
                <button
                  onClick={() => handleFeature(review.id, review.featured)}
                  disabled={actionLoading === review.id + "-feature"}
                  className={clsx(
                    "px-4 py-1.5 rounded font-semibold",
                    review.featured
                      ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                      : "bg-gray-200 text-gray-700 hover:bg-yellow-100"
                  )}
                >
                  {actionLoading === review.id + "-feature"
                    ? "Updating..."
                    : review.featured
                    ? "Unfeature"
                    : "Feature"}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={actionLoading === review.id + "-delete"}
                  className="px-4 py-1.5 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {actionLoading === review.id + "-delete" ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
