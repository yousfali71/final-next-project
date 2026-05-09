// Success response
exports.sendSuccess = (res, statusCode, data, message = "Success") => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

// Error response
exports.sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    status: "error",
    message,
  });
};

// Paginated response
exports.sendPaginatedResponse = (res, statusCode, data, page, limit, total) => {
  res.status(statusCode).json({
    status: "success",
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};
