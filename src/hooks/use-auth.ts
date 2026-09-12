"use client";

import { createContext, useContext } from "react";

import type { AppAuthUser } from "@/types";

export type AuthActionResult = { error?: string; message?: string };

export interface AuthContextValue {
  user: AppAuthUser | null;
  loading: boolean;
  configured: boolean;
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string, name: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
