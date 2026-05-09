const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getMyReviews,
  getReview,
  updateReview,
  deleteReview,
  canReview,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/:id", getReview);

// Protected routes
router.post("/", protect, upload.array("images", 5), createReview);
router.get("/my-reviews", protect, getMyReviews);
router.get("/can-review/:productId", protect, canReview);
router.put("/:id", protect, upload.array("images", 5), updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
