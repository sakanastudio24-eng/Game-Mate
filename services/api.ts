import Constants from "expo-constants";
import { Platform } from "react-native";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./storage";

const API_PORT = "8000";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function isPrivateNetworkHost(host: string) {
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "10.0.2.2"
  ) {
    return true;
  }

  if (host.startsWith("192.168.")) return true;
  if (host.startsWith("10.")) return true;

  const match = host.match(/^172\.(\d+)\./);
  if (match) {
    const secondOctet = Number(match[1]);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

  return false;
}

function stripHtmlDebugError(payload: string) {
  const normalized = payload.toLowerCase();
  const looksLikeHtml = normalized.includes("<!doctype html") || normalized.includes("<html");
  const looksLikeDjangoDebug =
    normalized.includes("you're seeing this error because you have debug = true") ||
    normalized.includes("debug = true") ||
    normalized.includes("debug=true");

  if (looksLikeHtml || looksLikeDjangoDebug) {
    return "Server error. Please try again.";
  }

  return payload;
}

function getExpoDevHost() {
  const possibleHostUri =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any)?.manifest?.debuggerHost;

  if (typeof possibleHostUri !== "string" || possibleHostUri.length === 0) return null;

  const host = possibleHostUri.split(":")[0];
  return host || null;
}

function inferExpoDevBaseUrl() {
  const host = getExpoDevHost();
  if (host) {
    return `http://${host}:${API_PORT}`;
  }

  // Android emulator localhost bridge.
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://127.0.0.1:8000";
}

function resolveBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configured) return inferExpoDevBaseUrl();

  try {
    const parsed = new URL(configured);
    const host = parsed.hostname;
    const expoHost = getExpoDevHost();

    // When running on a physical device, localhost points at the phone, not the dev machine.
    if (expoHost && (host === "127.0.0.1" || host === "localhost")) {
      return `${parsed.protocol}//${expoHost}${parsed.port ? `:${parsed.port}` : ""}`;
    }
  } catch {
    return configured;
  }

  return configured;
}

const BASE_URL = normalizeBaseUrl(resolveBaseUrl());

function getBaseUrlConfigurationError() {
  try {
    const parsed = new URL(BASE_URL);
    if (!__DEV__ && isPrivateNetworkHost(parsed.hostname)) {
      return "Production builds must use a public EXPO_PUBLIC_API_URL, not localhost or a private LAN address.";
    }
  } catch {
    return "EXPO_PUBLIC_API_URL is invalid. Use a full public URL such as https://api.gamemate.app.";
  }

  if (!__DEV__ && !process.env.EXPO_PUBLIC_API_URL?.trim()) {
    return "Production builds require EXPO_PUBLIC_API_URL to point to a public backend.";
  }

  return null;
}

const BASE_URL_CONFIGURATION_ERROR = getBaseUrlConfigurationError();

async function performRequest(endpoint: string, options: RequestInit, token?: string) {
  if (BASE_URL_CONFIGURATION_ERROR) {
    throw new Error(BASE_URL_CONFIGURATION_ERROR);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    return await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Request failed";
    throw new Error(`Network request failed (${BASE_URL}). ${detail}`);
  }
}

async function tryRefreshAccessToken() {
  const storedRefreshToken = await getRefreshToken();
  if (!storedRefreshToken) return null;

  const refreshResponse = await performRequest("/api/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: storedRefreshToken }),
  });

  if (!refreshResponse.ok) {
    await clearTokens();
    return null;
  }

  const payload = await refreshResponse.json();
  const data =
    payload && typeof payload === "object" && "data" in payload ? payload.data : payload;
  const nextAccess = data?.access;
  const nextRefresh = data?.refresh || storedRefreshToken;

  if (!nextAccess) {
    await clearTokens();
    return null;
  }

  await saveTokens(nextAccess, nextRefresh);
  return nextAccess as string;
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
) {
  const storedAccessToken = token ? await getAccessToken() : null;
  const initialToken = storedAccessToken || token;
  let response = await performRequest(endpoint, options, initialToken ?? undefined);

  const contentType = response.headers.get("content-type");
  let data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const isAuthenticatedRequest =
      Boolean(initialToken) &&
      endpoint !== "/api/auth/token/" &&
      endpoint !== "/api/auth/token/refresh/" &&
      endpoint !== "/api/auth/signup/";

    if (response.status === 401 && isAuthenticatedRequest) {
      try {
        const refreshedAccessToken = await tryRefreshAccessToken();
        if (refreshedAccessToken) {
          response = await performRequest(endpoint, options, refreshedAccessToken);
          const retryContentType = response.headers.get("content-type");
          data = retryContentType?.includes("application/json")
            ? await response.json()
            : await response.text();
          if (response.ok) {
            return data;
          }
        }
      } catch {
        await clearTokens();
      }
    }

    const resolvedErrorMessage =
      typeof data === "string"
        ? stripHtmlDebugError(data)
        : data?.message || data?.detail || "Request failed";

    if (response.status === 401) {
      // Login requests should surface credential errors, token-authenticated requests should
      // show a session-expired message.
      if (token) {
        throw new Error("Session expired. Please sign in again.");
      }
      throw new Error(resolvedErrorMessage || "Invalid email or password.");
    }
    throw new Error(resolvedErrorMessage);
  }

  return data;
}
