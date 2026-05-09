import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// Protect routes - verify JWT token
export const protect = async (request) => {
  try {
    let token;

    // Check for token in cookies or authorization header
    const cookieToken = request.cookies.get("token")?.value;
    const authHeader = request.headers.get("authorization");

    if (cookieToken) {
      token = cookieToken;
    } else if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return {
        authenticated: false,
        response: NextResponse.json(
          {
            status: "error",
            message: "Not authorized, no token",
          },
          { status: 401 },
        ),
      };
    }

    // Verify token
    const decoded = verifyToken(token);

    // Connect to database
    await connectDB();

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return {
        authenticated: false,
        response: NextResponse.json(
          {
            status: "error",
            message: "User not found",
          },
          { status: 401 },
        ),
      };
    }

    return {
      authenticated: true,
      user,
    };
  } catch (error) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          status: "error",
          message: "Not authorized, token failed",
        },
        { status: 401 },
      ),
    };
  }
};

// Authorize roles
export const authorize = (user, ...roles) => {
  if (!roles.includes(user.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          status: "error",
          message: `Role ${user.role} is not authorized to access this route`,
        },
        { status: 403 },
      ),
    };
  }
  return { authorized: true };
};
