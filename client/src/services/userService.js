import api from "./api";

// User service functions
const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const formData = new FormData();

    if (userData.name) formData.append("name", userData.name);
    if (userData.phone) formData.append("phone", userData.phone);
    if (userData.avatar) formData.append("avatar", userData.avatar);

    const response = await api.put("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/users/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Add address
  addAddress: async (addressData) => {
    const response = await api.post("/users/addresses", addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(
      `/users/addresses/${addressId}`,
      addressData,
    );
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
  },

  // Get wishlist
  getWishlist: async () => {
    const response = await api.get("/users/wishlist");
    return response.data;
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    const response = await api.post(`/users/wishlist/${productId}`);
    return response.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/users/wishlist/${productId}`);
    return response.data;
  },
};

export default userService;
