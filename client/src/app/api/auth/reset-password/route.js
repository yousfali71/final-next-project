import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hashToken } from "@/lib/crypto";
import { sendEmail } from "@/lib/email";
import { sendSuccess, sendError } from "@/lib/response";

export async function POST(request) {
  try {
    await connectDB();

    const { token, password } = await request.json();

    if (!token || !password) {
      return sendError("Token and new password are required", 400);
    }

    if (password.length < 6) {
      return sendError("Password must be at least 6 characters", 400);
    }

    // Hash token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with matching token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendError("Invalid or expired reset token", 400);
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

    return sendSuccess(
      null,
      200,
      "Password reset successful. You can now login with your new password.",
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return sendError(error.message || "Password reset failed", 500);
  }
}
