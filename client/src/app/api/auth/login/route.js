import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken, generateRefreshToken } from "@/lib/jwt";
import { sendSuccess, sendError } from "@/lib/response";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return sendError("Please provide email and password", 400);
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendError("Invalid credentials", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(
        "Your account has been deactivated. Please contact support.",
        403,
      );
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return sendError("Invalid credentials", 401);
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Create response
    const response = sendSuccess(
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
      200,
      "Login successful",
    );

    // Set refresh token in HTTP-only cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return sendError(error.message || "Login failed", 500);
  }
}
