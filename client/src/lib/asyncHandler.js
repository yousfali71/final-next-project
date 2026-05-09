// Async handler wrapper for Next.js API routes
export const asyncHandler = (fn) => {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({
          status: "error",
          message: error.message || "Internal Server Error",
        }),
        {
          status: error.statusCode || 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  };
};
