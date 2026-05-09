"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "@/services/authService";
import toast from "react-hot-toast";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Register user
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success(response.message);
          return response;
        } catch (error) {
          set({ isLoading: false });
          const message =
            error.response?.data?.message || "Registration failed";
          toast.error(message);
          throw error;
        }
      },

      // Login user
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success(response.message);
          return response;
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || "Login failed";
          toast.error(message);
          throw error;
        }
      },

      // Google OAuth login
      googleLogin: async (googleData) => {
        set({ isLoading: true });
        try {
          const response = await authService.googleAuth(googleData);
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success(response.message);
          return response;
        } catch (error) {
          set({ isLoading: false });
          const message =
            error.response?.data?.message || "Google login failed";
          toast.error(message);
          throw error;
        }
      },

      // Logout user
      logout: async () => {
        try {
          await authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          toast.success("Logged out successfully");
        } catch (error) {
          // Clear local state even if API call fails
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          console.error("Logout error:", error);
        }
      },

      // Load user from token
      loadUser: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await authService.getMe();
          set({
            user: response.data.user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem("token");
        }
      },

      // Update user profile
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      // Clear auth state
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("token");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
