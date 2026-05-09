const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const catchAsync = require("../utils/catchAsync");
const cloudinary = require("../config/cloudinary");

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = catchAsync(async (req, res) => {
  const { product, rating, comment } = req.body;

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user._id,
    product,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this product",
    });
  }

  // Check if user purchased this product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    "products.product": product,
    paymentStatus: "paid",
  });

  // Upload review images if provided
  let images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "reviews",
        width: 800,
        crop: "scale",
      });
      images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    product,
    rating,
    comment,
    images,
    isVerifiedPurchase: !!hasPurchased,
  });

  // Update product rating
  await updateProductRating(product);

  const populatedReview = await Review.findById(review._id).populate(
    "user",
    "name avatar",
  );

  res.status(201).json({
    success: true,
    data: populatedReview,
  });
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || "-createdAt";
  const rating = req.query.rating;

  const query = { product: req.params.productId };

  // Filter by rating if provided
  if (rating) {
    query.rating = parseInt(rating);
  }

  const reviews = await Review.find(query)
    .populate("user", "name avatar")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments(query);

  // Get rating statistics
  const stats = await Review.aggregate([
    { $match: { product: req.params.productId } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
  ]);

  const ratingStats = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  stats.forEach((stat) => {
    ratingStats[stat._id] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: reviews,
    ratingStats,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "title images slug")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "name avatar")
    .populate("product", "title images");

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = catchAsync(async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this review",
    });
  }

  const { rating, comment } = req.body;

  // Upload new images if provided
  let newImages = [];
  if (req.files && req.files.length > 0) {
    // Delete old images from cloudinary
    for (const image of review.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Upload new images
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "reviews",
        width: 800,
        crop: "scale",
      });
      newImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  } else {
    newImages = review.images;
  }

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  review.images = newImages;

  await review.save();

  // Update product rating
  await updateProductRating(review.product);

  const populatedReview = await Review.findById(review._id)
    .populate("user", "name avatar")
    .populate("product", "title images");

  res.status(200).json({
    success: true,
    data: populatedReview,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Check if user owns the review or is admin
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this review",
    });
  }

  // Delete images from cloudinary
  for (const image of review.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  const productId = review.product;
  await review.deleteOne();

  // Update product rating
  await updateProductRating(productId);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// @desc    Check if user can review product
// @route   GET /api/reviews/can-review/:productId
// @access  Private
exports.canReview = catchAsync(async (req, res) => {
  // Check if user already reviewed
  const existingReview = await Review.findOne({
    user: req.user._id,
    product: req.params.productId,
  });

  if (existingReview) {
    return res.status(200).json({
      success: true,
      canReview: false,
      reason: "already_reviewed",
      review: existingReview,
    });
  }

  // Check if user purchased the product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    "products.product": req.params.productId,
    paymentStatus: "paid",
  });

  res.status(200).json({
    success: true,
    canReview: true,
    isVerifiedPurchase: !!hasPurchased,
  });
});

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId });

  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
    return;
  }

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    rating: averageRating.toFixed(1),
    numReviews: reviews.length,
  });
}
