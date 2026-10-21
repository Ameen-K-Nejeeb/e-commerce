// src/components/ReviewModal.jsx
import React, { useState, useEffect } from "react";
import { Star, X, Sparkles } from "lucide-react";
import api from "../api/axios";

export default function ReviewModal({ isOpen, productId, productName, existingReview, onClose, onReviewSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        "Failed to submit appraisal. Please try again.";
        
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl border border-amber-100/60">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-serif font-black text-stone-900 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {existingReview ? "Update Appraisal" : "Appraise Piece"}
          </h3>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-stone-500 mb-6 font-medium">
          How was your experience with <strong>{productName}</strong>?
        </p>

        {error && (
          <div className="mb-5 p-3.5 text-xs bg-rose-50 text-rose-800 rounded-xl border border-rose-200 font-bold tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 mb-2 bg-stone-50/50 py-5 rounded-2xl border border-stone-100">
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
                  className={`w-9 h-9 ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-500 drop-shadow-sm"
                      : "text-amber-200/60 fill-amber-50"
                  } transition-all`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">
              Written Details (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Share details about the craftsmanship, quality, and your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm p-4 bg-stone-50 text-stone-900 placeholder:text-stone-400 border border-amber-200/80 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 rounded-full shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : (existingReview ? "Update" : "Publish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}