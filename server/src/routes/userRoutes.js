const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// All routes are protected (require authentication)
router.use(protect);

// Profile routes
router.get("/profile", userController.getProfile);
router.put("/profile", upload.single("avatar"), userController.updateProfile);
router.put("/change-password", userController.changePassword);

// Address routes
router.post("/addresses", userController.addAddress);
router.put("/addresses/:addressId", userController.updateAddress);
router.delete("/addresses/:addressId", userController.deleteAddress);

// Wishlist routes
router.get("/wishlist", userController.getWishlist);
router.post("/wishlist/:productId", userController.addToWishlist);
router.delete("/wishlist/:productId", userController.removeFromWishlist);

module.exports = router;
