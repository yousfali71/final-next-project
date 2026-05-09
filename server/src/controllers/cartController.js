const Cart = require("../models/Cart");
const Product = require("../models/Product");
const catchAsync = require("../utils/catchAsync");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "title slug images price discountPrice stock",
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = catchAsync(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (!product.isActive) {
    return res.status(400).json({
      success: false,
      message: "Product is not available",
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: "Not enough stock available",
    });
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  const price = product.discountPrice || product.price;

  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = price;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price,
    });
  }

  await cart.save();

  // Populate and return
  cart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "title slug images price discountPrice stock",
  });

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    data: cart,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
exports.updateCartItem = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be at least 1",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (quantity > product.stock) {
    return res.status(400).json({
      success: false,
      message: "Not enough stock available",
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Item not found in cart",
    });
  }

  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.discountPrice || product.price;

  await cart.save();

  cart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "title slug images price discountPrice stock",
  });

  res.status(200).json({
    success: true,
    message: "Cart updated",
    data: cart,
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
exports.removeFromCart = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "title slug images price discountPrice stock",
  });

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    data: populatedCart,
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared",
    data: cart,
  });
});

// @desc    Sync local cart with server (for guest -> logged in user)
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = catchAsync(async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: "Invalid cart items",
    });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Merge local cart items with server cart
  for (const localItem of items) {
    const product = await Product.findById(localItem.productId);
    if (!product || !product.isActive) continue;

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === localItem.productId,
    );

    const price = product.discountPrice || product.price;
    const quantity = Math.min(localItem.quantity, product.stock);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = Math.min(
        cart.items[existingIndex].quantity + quantity,
        product.stock,
      );
      cart.items[existingIndex].price = price;
    } else {
      cart.items.push({
        product: localItem.productId,
        quantity,
        price,
      });
    }
  }

  await cart.save();

  cart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "title slug images price discountPrice stock",
  });

  res.status(200).json({
    success: true,
    message: "Cart synced",
    data: cart,
  });
});
