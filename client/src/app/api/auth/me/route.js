import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { protect } from "@/middleware/auth";
import { sendSuccess, sendError } from "@/lib/response";

export async function GET(request) {
  try {
    // Protect route
    const authCheck = await protect(request);
    if (!authCheck.authenticated) {
      return authCheck.response;
    }

    await connectDB();

    const user = await User.findById(authCheck.user._id).select("-password");

    if (!user) {
      return sendError("User not found", 404);
    }

    return sendSuccess({ user });
  } catch (error) {
    console.error("Get me error:", error);
    return sendError(error.message || "Failed to get user", 500);
  }
}
