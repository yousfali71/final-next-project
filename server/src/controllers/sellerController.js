const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

// @desc    Get seller dashboard statistics
// @route   GET /api/seller/stats
// @access  Private (Seller)
exports.getSellerStats = catchAsync(async (req, res) => {
  const sellerId = req.user._id;

  // Get all seller products
  const products = await Product.find({ seller: sellerId });
  const productIds = products.map((p) => p._id);

  // Get all orders containing seller's products
  const orders = await Order.find({
    "products.product": { $in: productIds },
    paymentStatus: "paid",
  });

  // Calculate total revenue
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalItemsSold = 0;

  orders.forEach((order) => {
    order.products.forEach((item) => {
      if (productIds.some((id) => id.equals(item.product))) {
        totalRevenue += item.price * item.quantity;
        totalItemsSold += item.quantity;
      }
    });
    totalOrders++;
  });

  // Get pending orders
  const pendingOrders = await Order.find({
    "products.product": { $in: productIds },
    orderStatus: { $in: ["pending", "processing"] },
  }).countDocuments();

  // Get low stock products (less than 10)
  const lowStockProducts = await Product.find({
    seller: sellerId,
    stock: { $lt: 10 },
    isActive: true,
  }).countDocuments();

  // Get total products
  const totalProducts = await Product.find({
    seller: sellerId,
    isActive: true,
  }).countDocuments();

  // Get average rating
  const avgRatingResult = await Product.aggregate([
    { $match: { seller: sellerId, isActive: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  const averageRating = avgRatingResult[0]?.avgRating || 0;

  // Get revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        "products.product": { $in: productIds },
        paymentStatus: "paid",
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    { $unwind: "$products" },
    {
      $match: {
        "products.product": { $in: productIds },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: {
          $sum: {
            $multiply: ["$products.price", "$products.quantity"],
          },
        },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Get top selling products
  const topProducts = await Order.aggregate([
    {
      $match: {
        "products.product": { $in: productIds },
        paymentStatus: "paid",
      },
    },
    { $unwind: "$products" },
    {
      $match: {
        "products.product": { $in: productIds },
      },
    },
    {
      $group: {
        _id: "$products.product",
        totalSold: { $sum: "$products.quantity" },
        revenue: {
          $sum: {
            $multiply: ["$products.price", "$products.quantity"],
          },
        },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        totalSold: 1,
        revenue: 1,
        title: "$product.title",
        image: { $arrayElemAt: ["$product.images", 0] },
        price: "$product.price",
      },
    },
  ]);

  // Get recent orders
  const recentOrders = await Order.find({
    "products.product": { $in: productIds },
  })
    .sort("-createdAt")
    .limit(5)
    .populate("user", "name email")
    .select("_id orderStatus totalPrice createdAt user");

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalItemsSold,
        pendingOrders,
        lowStockProducts,
        averageRating: averageRating.toFixed(1),
      },
      revenueByMonth,
      topProducts,
      recentOrders,
    },
  });
});

// @desc    Get seller products with filters
// @route   GET /api/seller/products
// @access  Private (Seller)
exports.getSellerProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    sort = "-createdAt",
  } = req.query;

  const query = { seller: req.user._id };

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

// @desc    Get seller orders
// @route   GET /api/seller/orders
// @access  Private (Seller)
exports.getSellerOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, sort = "-createdAt" } = req.query;

  const sellerId = req.user._id;

  // Get seller's products
  const products = await Product.find({ seller: sellerId });
  const productIds = products.map((p) => p._id);

  const query = {
    "products.product": { $in: productIds },
  };

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

// @desc    Update order status (seller)
// @route   PUT /api/seller/orders/:id/status
// @access  Private (Seller)
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { orderStatus, trackingNumber } = req.body;
  const orderId = req.params.id;
  const sellerId = req.user._id;

  // Get seller's products
  const products = await Product.find({ seller: sellerId });
  const productIds = products.map((p) => p._id);

  // Find order and check if seller owns any products in it
  const order = await Order.findOne({
    _id: orderId,
    "products.product": { $in: productIds },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found or you don't have permission",
    });
  }

  // Update order status
  order.orderStatus = orderStatus;

  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  if (orderStatus === "delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

// @desc    Get seller revenue analytics
// @route   GET /api/seller/analytics/revenue
// @access  Private (Seller)
exports.getRevenueAnalytics = catchAsync(async (req, res) => {
  const { period = "month" } = req.query; // day, week, month, year
  const sellerId = req.user._id;

  const products = await Product.find({ seller: sellerId });
  const productIds = products.map((p) => p._id);

  let dateRange = new Date();
  let groupBy = {};

  switch (period) {
    case "day":
      dateRange.setDate(dateRange.getDate() - 30);
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      break;
    case "week":
      dateRange.setDate(dateRange.getDate() - 90);
      groupBy = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
      break;
    case "month":
      dateRange.setMonth(dateRange.getMonth() - 12);
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      break;
    case "year":
      dateRange.setFullYear(dateRange.getFullYear() - 5);
      groupBy = {
        year: { $year: "$createdAt" },
      };
      break;
  }

  const analytics = await Order.aggregate([
    {
      $match: {
        "products.product": { $in: productIds },
        paymentStatus: "paid",
        createdAt: { $gte: dateRange },
      },
    },
    { $unwind: "$products" },
    {
      $match: {
        "products.product": { $in: productIds },
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: {
          $sum: {
            $multiply: ["$products.price", "$products.quantity"],
          },
        },
        orders: { $addToSet: "$_id" },
        items: { $sum: "$products.quantity" },
      },
    },
    {
      $project: {
        _id: 1,
        revenue: 1,
        orders: { $size: "$orders" },
        items: 1,
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: analytics,
  });
});
