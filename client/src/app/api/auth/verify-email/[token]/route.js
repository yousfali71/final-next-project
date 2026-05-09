import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { hashToken } from "@/lib/crypto";
import { sendSuccess, sendError } from "@/lib/response";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const token = params.token;

    if (!token) {
      return sendError("Verification token is required", 400);
    }

    // Hash token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with matching token and not expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendError("Invalid or expired verification token", 400);
    }

    // Update user
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    return sendSuccess(null, 200, "Email verified successfully");
  } catch (error) {
    console.error("Email verification error:", error);
    return sendError(error.message || "Email verification failed", 500);
  }
}
