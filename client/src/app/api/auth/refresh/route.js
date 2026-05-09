import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken, verifyRefreshToken } from "@/lib/jwt";
import { sendSuccess, sendError } from "@/lib/response";

export async function POST(request) {
  try {
    await connectDB();

    // Get refresh token from cookies
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return sendError("No refresh token provided", 401);
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Get user
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return sendError("Invalid refresh token", 401);
      }

      // Generate new access token
      const accessToken = generateToken(user._id);

      return sendSuccess(
        { token: accessToken },
        200,
        "Token refreshed successfully",
      );
    } catch (error) {
      return sendError("Invalid or expired refresh token", 401);
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return sendError(error.message || "Token refresh failed", 500);
  }
}
