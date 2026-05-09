const Coupon = require("../models/Coupon");
const catchAsync = require("../utils/catchAsync");

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private (Admin)
exports.createCoupon = catchAsync(async (req, res) => {
  const {
    code,
    discount,
    discountType,
    minPurchase,
    maxDiscount,
    usageLimit,
    expiryDate,
    applicableCategories,
  } = req.body;

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return res.status(400).json({
      success: false,
      message: "Coupon code already exists",
    });
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discount,
    discountType,
    minPurchase,
    maxDiscount,
    usageLimit,
    expiryDate,
    applicableCategories,
  });

  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    data: coupon,
  });
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin)
exports.getAllCoupons = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    isActive,
    sort = "-createdAt",
  } = req.query;

  const query = {};

  // Search by code
  if (search) {
    query.code = { $regex: search, $options: "i" };
  }

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const skip = (page - 1) * limit;

  const coupons = await Coupon.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate("applicableCategories", "name");

  const total = await Coupon.countDocuments(query);

  res.status(200).json({
    success: true,
    data: coupons,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private (Admin)
exports.getCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id).populate(
    "applicableCategories",
    "name",
  );

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found",
    });
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
});

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = catchAsync(async (req, res) => {
  const { code, cartTotal, categoryIds } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Invalid coupon code",
    });
  }

  // Check if coupon is expired
  if (new Date(coupon.expiryDate) < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Coupon has expired",
    });
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({
      success: false,
      message: "Coupon usage limit reached",
    });
  }

  // Check minimum purchase requirement
  if (cartTotal < coupon.minPurchase) {
    return res.status(400).json({
      success: false,
      message: `Minimum purchase of $${coupon.minPurchase} required`,
    });
  }

  // Check category applicability
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const hasApplicableCategory = categoryIds?.some((catId) =>
      coupon.applicableCategories.some((applCat) => applCat.equals(catId)),
    );

    if (!hasApplicableCategory) {
      return res.status(400).json({
        success: false,
        message: "Coupon not applicable to cart items",
      });
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (cartTotal * coupon.discount) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discount;
  }

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    data: {
      couponId: coupon._id,
      code: coupon.code,
      discountAmount: discountAmount.toFixed(2),
      finalTotal: (cartTotal - discountAmount).toFixed(2),
    },
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
exports.updateCoupon = catchAsync(async (req, res) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found",
    });
  }

  // If updating code, check uniqueness
  if (req.body.code && req.body.code !== coupon.code) {
    const existingCoupon = await Coupon.findOne({
      code: req.body.code.toUpperCase(),
    });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }
    req.body.code = req.body.code.toUpperCase();
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Coupon updated successfully",
    data: coupon,
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found",
    });
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});

// @desc    Increment coupon usage
// @route   PUT /api/coupons/:id/use
// @access  Private
exports.useCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found",
    });
  }

  coupon.usedCount += 1;
  await coupon.save();

  res.status(200).json({
    success: true,
    message: "Coupon usage recorded",
  });
});
