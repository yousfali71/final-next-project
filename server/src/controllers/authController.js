const User = require("../models/User");
const { generateToken, generateRefreshToken } = require("../utils/jwt");
const { generateRandomToken, hashToken } = require("../utils/crypto");
const { sendEmail } = require("../config/email");
const { sendSuccess, sendError } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return sendError(res, 400, "Please provide all required fields");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, "User already exists with this email");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role === "seller" ? "seller" : "customer", // Admin role can only be set manually in DB
  });

  // Generate email verification token
  const verificationToken = generateRandomToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Create verification URL
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - Premium Marketplace",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Premium Marketplace!</h2>
          <p>Hi ${user.name},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendSuccess(
    res,
    201,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
      token: accessToken,
    },
    "Registration successful. Please check your email to verify your account.",
  );
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return sendError(res, 400, "Please provide email and password");
  }

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return sendError(res, 401, "Invalid credentials");
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(
      res,
      403,
      "Your account has been deactivated. Please contact support.",
    );
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    return sendError(res, 401, "Invalid credentials");
  }

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

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
        emailVerified: user.emailVerified,
      },
      token: accessToken,
    },
    "Login successful",
  );
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  // Clear refresh token cookie
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  sendSuccess(res, 200, null, "Logout successful");
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return sendError(res, 401, "No refresh token provided");
  }

  try {
    const { verifyRefreshToken } = require("../utils/jwt");
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 401, "Invalid refresh token");
    }

    // Generate new access token
    const accessToken = generateToken(user._id);

    sendSuccess(
      res,
      200,
      { token: accessToken },
      "Token refreshed successfully",
    );
  } catch (error) {
    return sendError(res, 401, "Invalid or expired refresh token");
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return sendError(res, 400, "Verification token is required");
  }

  // Hash token to compare with stored hash
  const hashedToken = hashToken(token);

  // Find user with matching token and not expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return sendError(res, 400, "Invalid or expired verification token");
  }

  // Update user
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  sendSuccess(res, 200, null, "Email verified successfully");
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 400, "Please provide an email address");
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists for security
    return sendSuccess(
      res,
      200,
      null,
      "If an account with that email exists, a password reset link has been sent.",
    );
  }

  // Generate reset token
  const resetToken = generateRandomToken();
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  // Send reset email
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - Premium Marketplace",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; font-size: 14px;">${resetUrl}</p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
      `,
    });

    sendSuccess(
      res,
      200,
      null,
      "If an account with that email exists, a password reset link has been sent.",
    );
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return sendError(
      res,
      500,
      "Failed to send reset email. Please try again later.",
    );
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return sendError(res, 400, "Token and new password are required");
  }

  if (password.length < 6) {
    return sendError(res, 400, "Password must be at least 6 characters");
  }

  // Hash token to compare with stored hash
  const hashedToken = hashToken(token);

  // Find user with matching token and not expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return sendError(res, 400, "Invalid or expired reset token");
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Send confirmation email
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful - Premium Marketplace",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Successful</h2>
          <p>Hi ${user.name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }

  sendSuccess(
    res,
    200,
    null,
    "Password reset successful. You can now login with your new password.",
  );
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  sendSuccess(res, 200, { user });
});

// @desc    Google OAuth callback
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = asyncHandler(async (req, res) => {
  const { googleId, email, name, avatar } = req.body;

  if (!googleId || !email) {
    return sendError(res, 400, "Invalid Google authentication data");
  }

  // Check if user exists
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // Update Google ID if user exists with same email
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    // Create new user
    user = await User.create({
      name,
      email,
      googleId,
      avatar: avatar ? { url: avatar } : undefined,
      emailVerified: true, // Google emails are already verified
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(
      res,
      403,
      "Your account has been deactivated. Please contact support.",
    );
  }

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

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
        emailVerified: user.emailVerified,
      },
      token: accessToken,
    },
    "Login successful",
  );
});
