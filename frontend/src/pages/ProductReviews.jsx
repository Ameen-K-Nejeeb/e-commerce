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
        "Failed to submit review. Please try again.";
        
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#080808]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] rounded-[2rem] max-w-md w-full p-8 shadow-2xl border border-[#C9A96A]/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-serif font-black text-[#C9A96A] flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C9A96A]" />
            {existingReview ? "Update Review" : "Review Piece"}
          </h3>
          <button onClick={onClose} className="p-2 text-[#F5E6D3]/50 hover:text-[#C9A96A] bg-black rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-[#F5E6D3]/70 mb-6 font-medium">
          How was your experience with <strong>{productName}</strong>?
        </p>

        {error && (
          <div className="mb-5 p-3.5 text-xs bg-red-900/30 text-red-400 rounded-xl border border-red-500/30 font-bold tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 mb-2 bg-[#080808] py-5 rounded-2xl border border-[#C9A96A]/10">
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
                      ? "fill-[#C9A96A] text-[#C9A96A] drop-shadow-sm"
                      : "text-[#F5E6D3]/20"
                  } transition-all`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C9A96A] mb-2">
              Written Details (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Share details about the fit, quality, and style..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm p-4 bg-[#080808] text-[#F5E6D3] placeholder:text-[#F5E6D3]/30 border border-[#C9A96A]/30 rounded-xl outline-none focus:border-[#C9A96A] focus:ring-1 focus:ring-[#C9A96A]/50 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#F5E6D3]/60 hover:text-white rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#080808] bg-[#C9A96A] hover:bg-[#B38D46] rounded-full transition-all disabled:opacity-50 shadow-md shadow-[#C9A96A]/10"
            >
              {loading ? "Saving..." : (existingReview ? "Update" : "Publish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}