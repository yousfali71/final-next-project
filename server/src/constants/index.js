// User roles
exports.USER_ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
};

// Order status
exports.ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Payment status
exports.PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// Payment methods
exports.PAYMENT_METHODS = {
  CARD: "card",
  COD: "cod",
};

// Default pagination
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 12;
exports.MAX_LIMIT = 100;

// File upload limits
exports.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
exports.ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Token expiry
exports.ACCESS_TOKEN_EXPIRY = "7d";
exports.REFRESH_TOKEN_EXPIRY = "30d";
exports.RESET_PASSWORD_EXPIRY = 10 * 60 * 1000; // 10 minutes
exports.EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
