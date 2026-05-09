const Product = require("../models/Product");
const catchAsync = require("../utils/catchAsync");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

// @desc    Get all products with filters, search, and pagination
// @route   GET /api/products
// @access  Public
exports.getAllProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    minPrice,
    maxPrice,
    brand,
    seller,
    sort = "-createdAt",
    featured,
    minRating,
    inStock,
  } = req.query;

  // Build query
  const query = { isActive: true };

  // Search by title, description, or brand
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by category (support multiple categories)
  if (category) {
    const categories = category.split(",");
    if (categories.length > 1) {
      query.category = { $in: categories };
    } else {
      query.category = category;
    }
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Filter by brand (support multiple brands)
  if (brand) {
    const brands = brand.split(",");
    if (brands.length > 1) {
      query.brand = { $in: brands };
    } else {
      query.brand = { $regex: brand, $options: "i" };
    }
  }

  // Filter by seller
  if (seller) {
    query.seller = seller;
  }

  // Filter by featured
  if (featured) {
    query.featured = featured === "true";
  }

  // Filter by minimum rating
  if (minRating) {
    query["ratings.average"] = { $gte: Number(minRating) };
  }

  // Filter by stock availability
  if (inStock === "true") {
    query.stock = { $gt: 0 };
  }

  // Handle sort options
  let sortOption = sort;
  switch (sort) {
    case "price-asc":
      sortOption = "price";
      break;
    case "price-desc":
      sortOption = "-price";
      break;
    case "rating":
      sortOption = "-ratings.average -ratings.count";
      break;
    case "popularity":
      sortOption = "-sold -ratings.count";
      break;
    case "newest":
      sortOption = "-createdAt";
      break;
    case "oldest":
      sortOption = "createdAt";
      break;
    default:
      sortOption = sort;
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Execute query
  const products = await Product.find(query)
    .populate("category", "name slug")
    .populate("seller", "name email avatar")
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  // Get total count for pagination
  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 8;

  const products = await Product.find({ featured: true, isActive: true })
    .populate("category", "name slug")
    .populate("seller", "name avatar")
    .sort("-createdAt")
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 8;

  const products = await Product.find({ isActive: true })
    .populate("category", "name slug")
    .populate("seller", "name avatar")
    .sort("-createdAt")
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get best selling products
// @route   GET /api/products/best-sellers
// @access  Public
exports.getBestSellers = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 8;

  const products = await Product.find({ isActive: true })
    .populate("category", "name slug")
    .populate("seller", "name avatar")
    .sort("-ratings.count")
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:identifier
// @access  Public
exports.getProduct = catchAsync(async (req, res) => {
  const { identifier } = req.params;

  // Check if identifier is a valid ObjectId
  const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);

  const product = isObjectId
    ? await Product.findById(identifier)
        .populate("category", "name slug")
        .populate("seller", "name email avatar phone")
        .populate({
          path: "reviews",
          populate: { path: "user", select: "name avatar" },
        })
    : await Product.findOne({ slug: identifier })
        .populate("category", "name slug")
        .populate("seller", "name email avatar phone")
        .populate({
          path: "reviews",
          populate: { path: "user", select: "name avatar" },
        });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
exports.createProduct = catchAsync(async (req, res) => {
  const {
    title,
    description,
    category,
    brand,
    stock,
    price,
    discountPrice,
    specifications,
    featured,
  } = req.body;

  // Add seller from authenticated user
  req.body.seller = req.user._id;

  // Handle image uploads
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.path, "products");
      images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  const product = await Product.create({
    title,
    description,
    category,
    brand,
    stock,
    price,
    discountPrice,
    specifications,
    featured,
    images,
    seller: req.user._id,
  });

  const populatedProduct = await Product.findById(product._id)
    .populate("category", "name slug")
    .populate("seller", "name email avatar");

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: populatedProduct,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
exports.updateProduct = catchAsync(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Check if user owns the product or is admin
  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this product",
    });
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    // Delete old images from cloudinary
    for (const image of product.images) {
      if (image.public_id) {
        await deleteFromCloudinary(image.public_id);
      }
    }

    // Upload new images
    const images = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.path, "products");
      images.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = images;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name slug")
    .populate("seller", "name email avatar");

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Check if user owns the product or is admin
  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete this product",
    });
  }

  // Delete images from cloudinary
  for (const image of product.images) {
    if (image.public_id) {
      await deleteFromCloudinary(image.public_id);
    }
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const limit = Number(req.query.limit) || 4;

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .populate("category", "name slug")
    .populate("seller", "name avatar")
    .limit(limit);

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    data: relatedProducts,
  });
});

// @desc    Get seller's products
// @route   GET /api/products/seller/:sellerId
// @access  Public
exports.getSellerProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find({
    seller: req.params.sellerId,
    isActive: true,
  })
    .populate("category", "name slug")
    .sort("-createdAt")
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments({
    seller: req.params.sellerId,
    isActive: true,
  });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    data: products,
  });
});

// @desc    Get search suggestions (autocomplete)
// @route   GET /api/products/search/suggestions
// @access  Public
exports.getSearchSuggestions = catchAsync(async (req, res) => {
  const { q, limit = 5 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  const searchRegex = { $regex: q, $options: "i" };

  // Get product title suggestions
  const products = await Product.find({
    isActive: true,
    $or: [{ title: searchRegex }, { brand: searchRegex }],
  })
    .select("title brand slug images")
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get filter options (brands, price ranges, ratings)
// @route   GET /api/products/filters/options
// @access  Public
exports.getFilterOptions = catchAsync(async (req, res) => {
  const { category } = req.query;

  const query = { isActive: true };
  if (category) {
    query.category = category;
  }

  // Get unique brands
  const brands = await Product.distinct("brand", query);

  // Get price range
  const priceStats = await Product.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  // Get rating distribution
  const ratingDistribution = await Product.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $floor: "$ratings.average" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      brands: brands.filter(Boolean).sort(),
      priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0 },
      ratingDistribution: ratingDistribution.map((item) => ({
        rating: item._id,
        count: item.count,
      })),
    },
  });
});
