"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";
import toast from "react-hot-toast";

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      cart: null,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,

      // Fetch cart from server
      fetchCart: async () => {
        try {
          set({ isLoading: true });
          const response = await api.get("/cart");
          const cartData = response.data.data;

          set({
            cart: cartData,
            items: cartData.items || [],
            totalItems: cartData.totalItems || 0,
            totalPrice: cartData.totalPrice || 0,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching cart:", error);
          set({ isLoading: false });
        }
      },

      // Add item to cart
      addToCart: async (productId, quantity = 1) => {
        try {
          set({ isLoading: true });
          const response = await api.post("/cart/items", {
            productId,
            quantity,
          });
          const cartData = response.data.data;

          set({
            cart: cartData,
            items: cartData.items || [],
            totalItems: cartData.totalItems || 0,
            totalPrice: cartData.totalPrice || 0,
            isLoading: false,
          });

          toast.success("Added to cart!");
          return true;
        } catch (error) {
          console.error("Error adding to cart:", error);
          toast.error(error.response?.data?.message || "Failed to add to cart");
          set({ isLoading: false });
          return false;
        }
      },

      // Update item quantity
      updateQuantity: async (productId, quantity) => {
        try {
          const response = await api.put(`/cart/items/${productId}`, {
            quantity,
          });
          const cartData = response.data.data;

          set({
            cart: cartData,
            items: cartData.items || [],
            totalItems: cartData.totalItems || 0,
            totalPrice: cartData.totalPrice || 0,
          });

          return true;
        } catch (error) {
          console.error("Error updating cart:", error);
          toast.error(
            error.response?.data?.message || "Failed to update quantity",
          );
          return false;
        }
      },

      // Remove item from cart
      removeFromCart: async (productId) => {
        try {
          const response = await api.delete(`/cart/items/${productId}`);
          const cartData = response.data.data;

          set({
            cart: cartData,
            items: cartData.items || [],
            totalItems: cartData.totalItems || 0,
            totalPrice: cartData.totalPrice || 0,
          });

          toast.success("Removed from cart");
          return true;
        } catch (error) {
          console.error("Error removing from cart:", error);
          toast.error("Failed to remove item");
          return false;
        }
      },

      // Clear cart
      clearCart: async () => {
        try {
          await api.delete("/cart");

          set({
            cart: null,
            items: [],
            totalItems: 0,
            totalPrice: 0,
          });

          toast.success("Cart cleared");
        } catch (error) {
          console.error("Error clearing cart:", error);
          toast.error("Failed to clear cart");
        }
      },

      // Sync local cart with server (for guest -> logged in user)
      syncCart: async (localItems) => {
        try {
          const response = await api.post("/cart/sync", { items: localItems });
          const cartData = response.data.data;

          set({
            cart: cartData,
            items: cartData.items || [],
            totalItems: cartData.totalItems || 0,
            totalPrice: cartData.totalPrice || 0,
          });
        } catch (error) {
          console.error("Error syncing cart:", error);
        }
      },

      // Get item from cart
      getCartItem: (productId) => {
        const { items } = get();
        return items.find(
          (item) =>
            item.product._id === productId || item.product === productId,
        );
      },

      // Check if item is in cart
      isInCart: (productId) => {
        const { items } = get();
        return items.some(
          (item) =>
            item.product._id === productId || item.product === productId,
        );
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        // Only persist items for guest users
        items: state.items,
      }),
    },
  ),
);

export default useCartStore;
