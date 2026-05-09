const express = require("express");
const router = express.Router();
const {
  getSellerStats,
  getSellerProducts,
  getSellerOrders,
  updateOrderStatus,
  getRevenueAnalytics,
} = require("../controllers/sellerController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication and seller role
router.use(protect);
router.use(authorize("seller", "admin"));

// Dashboard & Analytics
router.get("/stats", getSellerStats);
router.get("/analytics/revenue", getRevenueAnalytics);

// Products Management
router.get("/products", getSellerProducts);

// Orders Management
router.get("/orders", getSellerOrders);
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;
