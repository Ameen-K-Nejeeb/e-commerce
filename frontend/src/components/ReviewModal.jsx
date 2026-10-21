// src/components/ReviewModal.jsx
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import api from '../api/axios';

export default function ReviewModal({ isOpen, onClose, productId, productName, onReviewSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      onReviewSuccess(); // Notify parent to show a success message
      onClose(); // Close modal
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit review. You may have already reviewed this.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Rate & Review</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-rose-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <p className="text-xs text-gray-500 mb-4">
            How was your experience with <span className="font-bold text-gray-800">{productName}</span>?
          </p>

          {error && <div className="mb-4 text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</div>}

          {/* Star Selector */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  star <= (hoverRating || rating) 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-gray-200 hover:text-amber-200'
                }`}
              />
            ))}
          </div>

          {/* Comment Box */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Write your review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              className="w-full p-3 bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors"
              rows="4"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}