const Banner = require("../models/Banner");
const catchAsync = require("../utils/catchAsync");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private (Admin)
exports.createBanner = catchAsync(async (req, res) => {
  const { title, subtitle, link, buttonText, position, order } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a banner image",
    });
  }

  // Upload image to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, "banners");

  const banner = await Banner.create({
    title,
    subtitle,
    link,
    buttonText,
    position,
    order,
    image: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Banner created successfully",
    data: banner,
  });
});

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getAllBanners = catchAsync(async (req, res) => {
  const { position, isActive = true } = req.query;

  const query = {};

  if (position) {
    query.position = position;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const banners = await Banner.find(query).sort("order");

  res.status(200).json({
    success: true,
    data: banners,
  });
});

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
exports.getBanner = catchAsync(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: "Banner not found",
    });
  }

  res.status(200).json({
    success: true,
    data: banner,
  });
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private (Admin)
exports.updateBanner = catchAsync(async (req, res) => {
  let banner = await Banner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: "Banner not found",
    });
  }

  // If new image uploaded, delete old and upload new
  if (req.file) {
    // Delete old image from Cloudinary
    if (banner.image.public_id) {
      await deleteFromCloudinary(banner.image.public_id);
    }

    // Upload new image
    const result = await uploadToCloudinary(req.file.buffer, "banners");
    req.body.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Banner updated successfully",
    data: banner,
  });
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin)
exports.deleteBanner = catchAsync(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return res.status(404).json({
      success: false,
      message: "Banner not found",
    });
  }

  // Delete image from Cloudinary
  if (banner.image.public_id) {
    await deleteFromCloudinary(banner.image.public_id);
  }

  await banner.deleteOne();

  res.status(200).json({
    success: true,
    message: "Banner deleted successfully",
  });
});
