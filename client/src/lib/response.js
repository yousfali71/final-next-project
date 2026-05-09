import { NextResponse } from "next/server";

// Success response
export const sendSuccess = (data, statusCode = 200, message = "Success") => {
  return NextResponse.json(
    {
      status: "success",
      message,
      data,
    },
    { status: statusCode },
  );
};

// Error response
export const sendError = (message, statusCode = 400) => {
  return NextResponse.json(
    {
      status: "error",
      message,
    },
    { status: statusCode },
  );
};

// Paginated response
export const sendPaginatedResponse = (
  data,
  page,
  limit,
  total,
  statusCode = 200,
) => {
  return NextResponse.json(
    {
      status: "success",
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
    { status: statusCode },
  );
};
