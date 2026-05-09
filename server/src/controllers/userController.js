const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");
const { uploadImage, deleteImage } = require("../utils/imageUpload");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("wishlist", "title price images");

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  sendSuccess(res, 200, { user });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  // Update fields
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  // Handle avatar upload
  if (req.file) {
    // Delete old avatar if exists
    if (user.avatar && user.avatar.public_id) {
      await deleteImage(user.avatar.public_id);
    }

    // Upload new avatar
    const result = await uploadImage(req.file.buffer, "avatars");
    user.avatar = result;
  }

  await user.save();

  sendSuccess(
    res,
    200,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    },
    "Profile updated successfully",
  );
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  if (
    !fullName ||
    !phone ||
    !addressLine1 ||
    !city ||
    !state ||
    !postalCode ||
    !country
  ) {
    return sendError(res, 400, "Please provide all required address fields");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  // If this is set as default, unset all other defaults
  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  // Add new address
  user.addresses.push({
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefault: isDefault || user.addresses.length === 0, // First address is default
  });

  await user.save();

  sendSuccess(
    res,
    201,
    { addresses: user.addresses },
    "Address added successfully",
  );
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
exports.updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const address = user.addresses.id(addressId);

  if (!address) {
    return sendError(res, 404, "Address not found");
  }

  // Update fields
  if (fullName) address.fullName = fullName;
  if (phone) address.phone = phone;
  if (addressLine1) address.addressLine1 = addressLine1;
  if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
  if (city) address.city = city;
  if (state) address.state = state;
  if (postalCode) address.postalCode = postalCode;
  if (country) address.country = country;

  // Handle default status
  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
    address.isDefault = true;
  }

  await user.save();

  sendSuccess(
    res,
    200,
    { addresses: user.addresses },
    "Address updated successfully",
  );
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const address = user.addresses.id(addressId);

  if (!address) {
    return sendError(res, 404, "Address not found");
  }

  // Remove address
  address.deleteOne();

  // If deleted address was default and there are other addresses, make first one default
  if (address.isDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  sendSuccess(
    res,
    200,
    { addresses: user.addresses },
    "Address deleted successfully",
  );
});

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  // Check if product already in wishlist
  if (user.wishlist.includes(productId)) {
    return sendError(res, 400, "Product already in wishlist");
  }

  user.wishlist.push(productId);
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate(
    "wishlist",
    "title price images",
  );

  sendSuccess(
    res,
    200,
    { wishlist: updatedUser.wishlist },
    "Added to wishlist",
  );
});

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  user.wishlist = user.wishlist.filter((item) => item.toString() !== productId);
  await user.save();

  const updatedUser = await User.findById(req.user._id).populate(
    "wishlist",
    "title price images",
  );

  sendSuccess(
    res,
    200,
    { wishlist: updatedUser.wishlist },
    "Removed from wishlist",
  );
});

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "title price discountPrice images ratings stock",
  );

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  sendSuccess(res, 200, { wishlist: user.wishlist });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 400, "Please provide current and new password");
  }

  if (newPassword.length < 6) {
    return sendError(res, 400, "New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  // Check if user has password (not OAuth user)
  if (!user.password) {
    return sendError(res, 400, "Cannot change password for OAuth accounts");
  }

  // Verify current password
  const isPasswordMatch = await user.matchPassword(currentPassword);
  if (!isPasswordMatch) {
    return sendError(res, 401, "Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, 200, null, "Password changed successfully");
});
