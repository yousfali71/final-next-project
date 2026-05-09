const express = require("express");
const router = express.Router();
const {
  createBanner,
  getAllBanners,
  getBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.get("/", getAllBanners);
router.get("/:id", getBanner);

// Admin routes
router.use(protect);
router.use(authorize("admin"));

router.post("/", upload.single("image"), createBanner);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;
