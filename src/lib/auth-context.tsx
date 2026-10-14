"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type Role = "buyer" | "seller" | null;

type AuthCtx = {
  user: User | null;
  role: Role;
  name: string;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setRole(null);
      setName("");
      return;
    }
    const snap = await getDoc(doc(db, "users", u.uid));
    setRole(snap.exists() ? (snap.data().role as Role) : null);
    setName(snap.exists() ? snap.data().name ?? "" : "");
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      try {
        await loadProfile(u);
      } finally {
        setLoading(false);
      }
    });
  }, [loadProfile]);

  const value: AuthCtx = {
    user,
    role,
    name,
    loading,
    refreshProfile: () => loadProfile(auth.currentUser),
    logout: () => signOut(auth),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}