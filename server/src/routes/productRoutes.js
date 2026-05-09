const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  getSellerProducts,
  getSearchSuggestions,
  getFilterOptions,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/search/suggestions", getSearchSuggestions);
router.get("/filters/options", getFilterOptions);
router.get("/seller/:sellerId", getSellerProducts);
router.get("/:identifier", getProduct);
router.get("/:id/related", getRelatedProducts);

// Protected routes - Seller/Admin only
router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  createProduct,
);

router.put(
  "/:id",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  updateProduct,
);

router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

module.exports = router;
