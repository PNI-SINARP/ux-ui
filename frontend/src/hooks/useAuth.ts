"use client";

import { useState, useCallback } from "react";

/**
 * Stub useAuth hook — placeholder until Firebase Auth integration is complete.
 * Provides the shape expected by IntranetSidebar so the project type-checks.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export function useAuth() {
  const [user] = useState<AuthUser | null>(null);

  const logout = useCallback(async () => {
    // TODO: implement Firebase signOut
  }, []);

  return { user, logout };
}
