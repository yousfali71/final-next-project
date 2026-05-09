// API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // User
  GET_PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",

  // Products
  GET_PRODUCTS: "/products",
  GET_PRODUCT: "/products",

  // Orders
  CREATE_ORDER: "/orders",
  GET_ORDERS: "/orders/my-orders",

  // Cart
  ADD_TO_CART: "/cart/add",
  REMOVE_FROM_CART: "/cart/remove",
  GET_CART: "/cart",

  // Wishlist
  ADD_TO_WISHLIST: "/wishlist/add",
  REMOVE_FROM_WISHLIST: "/wishlist/remove",
  GET_WISHLIST: "/wishlist",
};

// User roles
export const USER_ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
};

// Order status
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Payment methods
export const PAYMENT_METHODS = {
  CARD: "card",
  COD: "cod",
};
