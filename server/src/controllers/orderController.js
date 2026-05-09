const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const catchAsync = require("../utils/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = catchAsync(async (req, res) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  // Validate stock and calculate totals
  let subtotal = 0;
  const products = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product ${item.product.title} not found`,
      });
    }

    if (!product.active) {
      return res.status(400).json({
        success: false,
        message: `Product ${product.title} is no longer available`,
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.title}. Only ${product.stock} available`,
      });
    }

    const price = product.discountPrice || product.price;
    subtotal += price * item.quantity;

    products.push({
      product: product._id,
      quantity: item.quantity,
      price: price,
      seller: product.seller,
    });
  }

  // Calculate shipping (free over $100, otherwise $10)
  const shippingFee = subtotal >= 100 ? 0 : 10;

  // Calculate total
  const totalPrice = subtotal + shippingFee;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    products,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingFee,
    totalPrice,
    notes: notes || "",
  });

  // Update product stock
  for (const item of products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], totalItems: 0, totalPrice: 0 },
  );

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Create Stripe payment intent
// @route   POST /api/orders/create-payment-intent
// @access  Private
exports.createPaymentIntent = catchAsync(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid amount",
    });
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: "usd",
    metadata: {
      userId: req.user._id.toString(),
    },
  });

  res.status(200).json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
    },
  });
});

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
exports.updatePaymentStatus = catchAsync(async (req, res) => {
  const { paymentIntentId, status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this order",
    });
  }

  order.paymentStatus = status;

  if (!order.paymentInfo) {
    order.paymentInfo = {};
  }

  order.paymentInfo.stripePaymentIntentId = paymentIntentId;

  if (status === "paid") {
    order.paymentInfo.paidAt = Date.now();
    order.orderStatus = "processing";
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get all orders for logged in user
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("items.product", "title images slug")
    .populate("items.seller", "businessName");

  const total = await Order.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("products.product", "title images slug")
    .populate("products.seller", "businessName email")
    .populate("user", "name email");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if user is authorized (owner, seller, or admin)
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isSeller = order.products.some(
    (item) => item.seller && item.seller.toString() === req.user._id.toString(),
  );
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isSeller && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view this order",
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to cancel this order",
    });
  }

  if (order.orderStatus === "delivered" || order.orderStatus === "cancelled") {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel order with status: ${order.orderStatus}`,
    });
  }

  // Restore product stock
  for (const item of order.products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = Date.now();
  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status (seller/admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin)
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if user is seller of any product in order
  const isSeller = order.items.some(
    (item) => item.seller && item.seller.toString() === req.user._id.toString(),
  );
  const isAdmin = req.user.role === "admin";

  if (!isSeller && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this order",
    });
  }

  order.status = status;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  if (status === "delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get seller orders
// @route   GET /api/orders/seller/orders
// @access  Private (Seller)
exports.getSellerOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Find orders that contain items from this seller
  const orders = await Order.find({
    "products.seller": req.user._id,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name email")
    .populate("products.product", "title images");

  const total = await Order.countDocuments({
    "products.seller": req.user._id,
  });

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get all orders (admin only)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
exports.getAllOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name email")
    .populate("products.product", "title images")
    .populate("products.seller", "businessName");

  const total = await Order.countDocuments();

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
