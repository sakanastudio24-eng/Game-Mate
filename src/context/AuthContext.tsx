import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login, refreshToken } from "../../services/auth";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "../../services/storage";
import { SESSION_EXPIRED_MESSAGE } from "../lib/auth-messages";

type AuthState = {
  user: any | null;
  accessToken: string | null;
  loading: boolean;
  authError: string | null;
  authSuccess: string | null;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  expireSession: () => Promise<void>;
  clearAuthMessages: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const clearAuthMessages = () => {
    setAuthError(null);
    setAuthSuccess(null);
  };

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      setLoading(true);
      setAuthError(null);
      const [storedAccessToken, storedRefreshToken] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
      ]);

      if (!storedAccessToken && !storedRefreshToken) {
        if (!mounted) return;
        setAccessToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        if (storedAccessToken) {
          const me = await getMe(storedAccessToken);
          if (!mounted) return;
          setAccessToken(storedAccessToken);
          setUser(me);
          setAuthSuccess("Session restored.");
          setLoading(false);
          return;
        }
      } catch {
        // Access token may be expired. Continue to refresh token fallback.
      }

      if (storedRefreshToken) {
        try {
          const refreshedTokens = await refreshToken(storedRefreshToken);
          const nextAccessToken = refreshedTokens.access;
          const nextRefreshToken = refreshedTokens.refresh || storedRefreshToken;
          await saveTokens(nextAccessToken, nextRefreshToken);
          const me = await getMe(nextAccessToken);
          if (!mounted) return;
          setAccessToken(nextAccessToken);
          setUser(me);
          setAuthSuccess("Session restored.");
          setLoading(false);
          return;
        } catch {
          // Refresh failed. Clear and require login.
        }
      }

      try {
        await clearTokens();
      } catch {
        // Ignore clear failures in restore flow.
      } finally {
        if (!mounted) return;
        setAccessToken(null);
        setUser(null);
        setAuthError(SESSION_EXPIRED_MESSAGE);
        setLoading(false);
      }

      if (mounted) setLoading(false);
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    clearAuthMessages();
    try {
      const tokens = await login(email, password);
      await saveTokens(tokens.access, tokens.refresh);
      const me = await getMe(tokens.access);
      setAccessToken(tokens.access);
      setUser(me);
      setAuthSuccess("Sign in successful.");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to sign in.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    clearAuthMessages();
    try {
      await clearTokens();
      setAccessToken(null);
      setUser(null);
      setAuthSuccess("Signed out.");
    } finally {
      setLoading(false);
    }
  };

  const expireSession = async () => {
    setLoading(true);
    setAccessToken(null);
    setUser(null);
    setAuthSuccess(null);
    setAuthError(SESSION_EXPIRED_MESSAGE);
    try {
      await clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      authError,
      authSuccess,
      loginUser,
      logoutUser,
      expireSession,
      clearAuthMessages,
    }),
    [accessToken, authError, authSuccess, loading, user],
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
