"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Upload, X, Loader2 } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function ReviewForm({
  productId,
  onSuccess,
  existingReview = null,
}) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(
    existingReview?.images?.map((img) => img.url) || [],
  );
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imagePreviews.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImages([...images, ...files]);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    if (comment.length > 500) {
      toast.error("Comment must be less than 500 characters");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("product", productId);
      formData.append("rating", rating);
      formData.append("comment", comment);

      images.forEach((image) => {
        formData.append("images", image);
      });

      let response;
      if (existingReview) {
        response = await api.put(`/reviews/${existingReview._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/reviews", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success(
        existingReview
          ? "Review updated successfully!"
          : "Review submitted successfully!",
      );

      if (onSuccess) {
        onSuccess(response.data.data);
      }

      // Reset form if creating new review
      if (!existingReview) {
        setRating(0);
        setComment("");
        setImages([]);
        setImagePreviews([]);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </h3>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          maxLength="500"
          className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          placeholder="Share your experience with this product..."
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Share details about your experience</span>
          <span>{comment.length}/500</span>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Photos (Optional)
        </label>
        <div className="space-y-3">
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {imagePreviews.length < 5 && (
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
              <div className="text-center">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">
                  Upload Photos ({imagePreviews.length}/5)
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          You can upload up to 5 photos (JPG, PNG, max 5MB each)
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={loading || rating === 0 || !comment.trim()}
          className="flex-1 gradient-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>{existingReview ? "Update Review" : "Submit Review"}</>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
