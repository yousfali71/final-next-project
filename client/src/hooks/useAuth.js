"use client";

import useAuthStore from "@/store/useAuthStore";

export function useAuth() {
  const { isAuthenticated, user, isLoading, logout } = useAuthStore();

  return {
    isAuthenticated,
    user,
    isLoading,
    logout,
  };
}
