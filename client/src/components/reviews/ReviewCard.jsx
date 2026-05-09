"use client";

import { motion } from "framer-motion";
import { Star, CheckCircle, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 border border-border/40"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.user?.avatar?.url ? (
            <img
              src={review.user.avatar.url}
              alt={review.user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {review.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{review.user?.name}</h4>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(review.rating)}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-foreground leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`Review ${index + 1}`}
              className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(image.url, "_blank")}
            />
          ))}
        </div>
      )}

      {/* Footer - Helpful Button (placeholder for future feature) */}
      <div className="flex items-center gap-4 pt-4 border-t border-border/40">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ThumbsUp className="h-4 w-4" />
          <span>Helpful</span>
        </button>
      </div>
    </motion.div>
  );
}
