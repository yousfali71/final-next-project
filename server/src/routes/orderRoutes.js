const express = require("express");
const router = express.Router();
const {
  createOrder,
  createPaymentIntent,
  updatePaymentStatus,
  getMyOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
  getSellerOrders,
  getAllOrders,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

// User routes
router.post("/", protect, createOrder);
router.post("/create-payment-intent", protect, createPaymentIntent);
router.get("/", protect, getMyOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/payment", protect, updatePaymentStatus);
router.put("/:id/cancel", protect, cancelOrder);

// Seller routes
router.get(
  "/seller/orders",
  protect,
  authorize("seller", "admin"),
  getSellerOrders,
);
router.put(
  "/:id/status",
  protect,
  authorize("seller", "admin"),
  updateOrderStatus,
);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAllOrders);

module.exports = router;
