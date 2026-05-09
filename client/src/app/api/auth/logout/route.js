import { sendSuccess } from "@/lib/response";

export async function POST(request) {
  // Create response
  const response = sendSuccess(null, 200, "Logout successful");

  // Clear refresh token cookie
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
}
