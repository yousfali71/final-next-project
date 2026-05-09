const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getAllReviews,
  deleteReview,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/stats", getAdminStats);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Product Management
router.get("/products", getAllProducts);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Order Management
router.get("/orders", getAllOrders);

// Review Management
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

module.exports = router;
