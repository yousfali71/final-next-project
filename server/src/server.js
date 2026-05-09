require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Load all models (required for populate to work)
const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Review = require("./models/Review");
const Order = require("./models/Order");
const Coupon = require("./models/Coupon");
const Banner = require("./models/Banner");
const Cart = require("./models/Cart");

// Log loaded models
console.log("✅ Models loaded:", {
  User: !!User,
  Category: !!Category,
  Product: !!Product,
  Review: !!Review,
  Order: !!Order,
  Coupon: !!Coupon,
  Banner: !!Banner,
  Cart: !!Cart,
});

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/banners", require("./routes/bannerRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/sellers", require("./routes/sellerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
