"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAllowedUser, signOut } from "@/lib/auth";
import { upsertUser } from "@/lib/firestore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let allowed = await isAllowedUser(firebaseUser);

        if (!allowed) {
          // No claim yet — try auto-granting via allowlist
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch("/api/auth/grant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          if (res.ok) {
            // Force token refresh so the new claim is included
            await firebaseUser.getIdToken(true);
            allowed = await isAllowedUser(firebaseUser);
          }
        }

        if (!allowed) {
          await signOut();
          setError(
            "Přístup odepřen. Váš Google účet nemá oprávnění k přístupu do této aplikace."
          );
          setUser(null);
        } else {
          // Valid user — persist to Firestore
          await upsertUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName ?? firebaseUser.email!,
          });
          setUser(firebaseUser);
          setError(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, clearError: () => setError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
