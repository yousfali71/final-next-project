const express = require("express");
const router = express.Router();

// Placeholder routes
router.get("/", (req, res) => {
  res.status(501).json({ message: "Category routes coming soon" });
});

module.exports = router;
