import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface User {
  id: string | number;
  username: string;
  role: "user" | "admin";
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Helper to get profile from DB
    const getProfile = async (session: any) => {
      if (!session?.user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      return {
        id: session.user.id,
        username:
          profile?.username ||
          session.user.user_metadata.username ||
          session.user.email?.split("@")[0] ||
          "User",
        role: profile?.role || "user",
        email: session.user.email,
      };
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Optimistic update
        setUser({
          id: session.user.id,
          username:
            session.user.user_metadata.username ||
            session.user.email?.split("@")[0] ||
            "User",
          role: "user", // Default to user initially
          email: session.user.email,
        });

        // Background fetch
        getProfile(session).then((user) => {
          if (user) setUser(user);
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Optimistic update
        setUser({
          id: session.user.id,
          username:
            session.user.user_metadata.username ||
            session.user.email?.split("@")[0] ||
            "User",
          role: "user", // Default to user initially
          email: session.user.email,
        });

        // Background fetch
        const user = await getProfile(session);
        if (user) setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (_token: string, userData: User) => {
    // Manually setting user if needed, though onAuthStateChange handles it.
    // Keeping this for compatibility with existing calls.
    setUser(userData);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
