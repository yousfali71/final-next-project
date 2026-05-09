const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  useCoupon,
} = require("../controllers/couponController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.post("/validate", protect, validateCoupon);

// Admin routes
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getAllCoupons).post(createCoupon);

router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

router.put("/:id/use", useCoupon);

module.exports = router;
