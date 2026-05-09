import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateRandomToken, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/lib/email";
import { sendSuccess, sendError } from "@/lib/response";

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return sendError("Please provide an email address", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return sendSuccess(
        null,
        200,
        "If an account with that email exists, a password reset link has been sent.",
      );
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

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

      return sendSuccess(
        null,
        200,
        "If an account with that email exists, a password reset link has been sent.",
      );
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return sendError(
        "Failed to send reset email. Please try again later.",
        500,
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return sendError(error.message || "Password reset request failed", 500);
  }
}
