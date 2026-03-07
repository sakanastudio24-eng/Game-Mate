import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login } from "../../services/auth";
import { clearTokens, getAccessToken, saveTokens } from "../../services/storage";

type AuthState = {
  user: any | null;
  accessToken: string | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      setLoading(true);
      const token = await getAccessToken();

      if (!token) {
        if (!mounted) return;
        setAccessToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const me = await getMe(token);
        if (!mounted) return;
        setAccessToken(token);
        setUser(me);
      } catch {
        await clearTokens();
        if (!mounted) return;
        setAccessToken(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    try {
      const tokens = await login(email, password);
      await saveTokens(tokens.access, tokens.refresh);
      const me = await getMe(tokens.access);
      setAccessToken(tokens.access);
      setUser(me);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await clearTokens();
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      loginUser,
      logoutUser,
    }),
    [accessToken, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
