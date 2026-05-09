"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import userService from "@/services/userService";
import toast from "react-hot-toast";

const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      isLoading: false,

      // Fetch wishlist
      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const response = await userService.getWishlist();
          set({ wishlist: response.data.wishlist, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error("Error fetching wishlist:", error);
        }
      },

      // Add to wishlist
      addToWishlist: async (productId) => {
        try {
          const response = await userService.addToWishlist(productId);
          set({ wishlist: response.data.wishlist });
          toast.success(response.message);
        } catch (error) {
          const message =
            error.response?.data?.message || "Failed to add to wishlist";
          toast.error(message);
          throw error;
        }
      },

      // Remove from wishlist
      removeFromWishlist: async (productId) => {
        try {
          const response = await userService.removeFromWishlist(productId);
          set({ wishlist: response.data.wishlist });
          toast.success(response.message);
        } catch (error) {
          const message =
            error.response?.data?.message || "Failed to remove from wishlist";
          toast.error(message);
          throw error;
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.some(
          (item) => item._id === productId || item.id === productId,
        );
      },

      // Clear wishlist
      clearWishlist: () => {
        set({ wishlist: [] });
      },
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({
        wishlist: state.wishlist,
      }),
    },
  ),
);

export default useWishlistStore;
