import React, { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import api from "../api/axios";

// NEW: Add existingReview to props
export default function ReviewModal({ isOpen, productId, productName, existingReview, onClose, onReviewSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // NEW: Pre-fill the form if existingReview data is passed
  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating);
        setComment(existingReview.comment);
      } else {
        setRating(0);
        setComment("");
      }
      setError("");
    }
  }, [isOpen, existingReview]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setLoading(true);
    try {
      // This matches your upsert backend! If it exists, it updates. If not, creates.
      await api.post(`store/products/${productId}/reviews/`, {
        rating,
        comment
      });
      onReviewSuccess();
      onClose(); 
    } catch (err) {
      const errorData = err.response?.data;
      const errorMsg = 
        errorData?.error || 
        errorData?.detail || 
        errorData?.non_field_errors?.[0] || 
        "Failed to submit review. Please try again.";
        
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {existingReview ? "Edit Your Review" : "Rate Product"}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mb-5">
          How was your experience with <strong>{productName}</strong>?
        </p>

        {error && (
          <div className="mb-4 p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200 fill-gray-50"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
              Written Review (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="What did you like or dislike? How is the quality?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-3 bg-white text-gray-700 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : (existingReview ? "Update Review" : "Submit Review")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}