const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const catchAsync = require("../utils/catchAsync");

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = catchAsync(async (req, res) => {
  // Total counts
  const totalUsers = await User.countDocuments();
  const totalSellers = await User.countDocuments({ role: "seller" });
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  // Pending approvals
  const pendingProducts = await Product.countDocuments({
    isActive: false,
    isApproved: false,
  });

  const pendingOrders = await Order.countDocuments({
    orderStatus: { $in: ["pending", "processing"] },
  });

  // Recent activity
  const recentUsers = await User.find()
    .sort("-createdAt")
    .limit(5)
    .select("name email role createdAt");

  const recentOrders = await Order.find()
    .sort("-createdAt")
    .limit(5)
    .populate("user", "name email")
    .select("_id orderStatus totalPrice createdAt user");

  const recentProducts = await Product.find()
    .sort("-createdAt")
    .limit(5)
    .populate("seller", "name")
    .select("title images price seller createdAt");

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Order status distribution
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  // Top sellers by revenue
  const topSellers = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$productInfo.seller",
        revenue: {
          $sum: {
            $multiply: ["$products.price", "$products.quantity"],
          },
        },
        orders: { $sum: 1 },
        products: { $addToSet: "$products.product" },
      },
    },
    {
      $project: {
        _id: 1,
        revenue: 1,
        orders: 1,
        productCount: { $size: "$products" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "seller",
      },
    },
    { $unwind: "$seller" },
    {
      $project: {
        _id: 1,
        revenue: 1,
        orders: 1,
        productCount: 1,
        name: "$seller.name",
        email: "$seller.email",
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingProducts,
        pendingOrders,
      },
      recentActivity: {
        users: recentUsers,
        orders: recentOrders,
        products: recentProducts,
      },
      analytics: {
        revenueByMonth,
        ordersByStatus,
        topSellers,
      },
    },
  });
});

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, role, sort = "-createdAt" } = req.query;

  const query = {};

  // Search by name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by role
  if (role) {
    query.role = role;
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .select("-password");

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Update user status/role
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = catchAsync(async (req, res) => {
  const { role, isActive } = req.body;

  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (role) user.role = role;
  if (typeof isActive !== "undefined") user.isActive = isActive;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc    Get all products with filters
// @route   GET /api/admin/products
// @access  Private (Admin)
exports.getAllProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    sort = "-createdAt",
  } = req.query;

  const query = {};

  // Search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by status
  if (status === "active") {
    query.isActive = true;
  } else if (status === "inactive") {
    query.isActive = false;
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate("seller", "name email")
    .populate("category", "name");

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Update product status
// @route   PUT /api/admin/products/:id
// @access  Private (Admin)
exports.updateProduct = catchAsync(async (req, res) => {
  const { isActive } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (typeof isActive !== "undefined") {
    product.isActive = isActive;
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Get all orders with filters
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, sort = "-createdAt" } = req.query;

  const query = {};

  // Filter by status
  if (status) {
    query.orderStatus = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate("user", "name email")
    .populate("products.product", "title images");

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get all reviews with filters
// @route   GET /api/admin/reviews
// @access  Private (Admin)
exports.getAllReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, rating, sort = "-createdAt" } = req.query;

  const query = {};

  // Filter by rating
  if (rating) {
    query.rating = Number(rating);
  }

  const skip = (page - 1) * limit;

  const reviews = await Review.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate("user", "name email")
    .populate("product", "title images");

  const total = await Review.countDocuments(query);

  res.status(200).json({
    success: true,
    data: reviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
exports.deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Delete review images from cloudinary
  if (review.images && review.images.length > 0) {
    const { deleteFromCloudinary } = require("../config/cloudinary");
    for (const image of review.images) {
      await deleteFromCloudinary(image.public_id);
    }
  }

  await review.deleteOne();

  // Update product rating
  const Product = require("../models/Product");
  const reviews = await Review.find({ product: review.product });
  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0;

  await Product.findByIdAndUpdate(review.product, {
    rating: avgRating,
    numReviews: reviews.length,
  });

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});
