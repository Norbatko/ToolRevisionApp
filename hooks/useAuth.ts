"use client";

import { useAuthContext } from "@/context/AuthContext";
import { signInWithGoogle, signOut } from "@/lib/auth";

export function useAuth() {
  const { user, loading, error, clearError } = useAuthContext();

  return {
    user,
    loading,
    error,
    clearError,
    signIn: signInWithGoogle,
    signOut,
  };
}
