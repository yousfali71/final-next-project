const express = require("express");
const router = express.Router();

// Placeholder routes
router.get("/", (req, res) => {
  res.status(501).json({ message: "Payment routes coming soon" });
});

module.exports = router;
