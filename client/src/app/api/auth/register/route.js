import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken, generateRefreshToken } from "@/lib/jwt";
import { generateRandomToken, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/lib/email";
import { sendSuccess, sendError } from "@/lib/response";

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return sendError("Please provide all required fields", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError("User already exists with this email", 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role === "seller" ? "seller" : "customer",
    });

    // Generate email verification token
    const verificationToken = generateRandomToken();
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

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

    // Create response with cookie
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
      201,
      "Registration successful. Please check your email to verify your account.",
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
    console.error("Registration error:", error);
    return sendError(error.message || "Registration failed", 500);
  }
}
